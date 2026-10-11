/*
 * THE ORGAN AS A MIDI PORT (repl/native/organ-midi.c)
 *
 * The author: "we should use web midi api, because then we have a ubiquitous
 * low level computation control point of convergence for sensory input at
 * these 8 ports". A MIDI status byte is 1kkk cccc: three bits of kind (the 8
 * status nibbles 8-F) and four of channel (16 lanes); data bytes are 7 bits,
 * the width of a Fano mask. wiki: SPEC-07 I-104.
 *
 * The classic ESP32 has no native USB, so it cannot be a USB-MIDI device. This
 * bridge, all user space, makes it a port: it reads the parity organ over
 * serial and offers an ALSA sequencer port "omi organ:0", which a browser's
 * Web MIDI lists in MIDIAccess.inputs and .outputs.
 *
 *   every line from the board  ->  SysEx F0 7D <line> F7  (0x7D: non-commercial;
 *                                   the line is ASCII, so every byte is < 0x80)
 *   each reflect line          ->  also Control Change on channel (tick & 15),
 *                                   controller = parity byte, value = pole << 6 |
 *                                   (dev != 0): readable without SysEx permission
 *   SysEx F0 7D <request> F7   ->  "<request>\n" to the board
 *
 * Build: cc -O2 -o organ-midi organ-midi.c -lasound
 * Run:   ./organ-midi /dev/ttyUSB0            (serve)
 *        ./organ-midi --ask "GET /atom/5"     (a second client: ask, print the answer up to 218)
 *        ./organ-midi --listen 8              (a second client: print 8 events)
 */
#include <alsa/asoundlib.h>
#include <errno.h>
#include <fcntl.h>
#include <poll.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <termios.h>
#include <time.h>
#include <unistd.h>

#define MAKER 0x7D

static int open_serial(const char *path) {
    int fd = open(path, O_RDWR | O_NOCTTY);
    if (fd < 0) { perror(path); exit(1); }
    struct termios t;
    tcgetattr(fd, &t);
    cfmakeraw(&t);
    cfsetspeed(&t, B115200);
    t.c_cflag |= CLOCAL | CREAD;
    t.c_cflag &= ~(CRTSCTS | HUPCL);
    t.c_cc[VMIN] = 0;
    t.c_cc[VTIME] = 0;
    tcsetattr(fd, TCSANOW, &t);
    usleep(300000);      /* let the USB serial layer settle, then drop what came before */
    tcflush(fd, TCIOFLUSH);
    return fd;
}

static snd_seq_t *open_seq(const char *name, int *port) {
    snd_seq_t *seq;
    if (snd_seq_open(&seq, "default", SND_SEQ_OPEN_DUPLEX, 0) < 0) { fprintf(stderr, "no ALSA sequencer\n"); exit(1); }
    snd_seq_set_client_name(seq, name);
    *port = snd_seq_create_simple_port(seq, name,
        SND_SEQ_PORT_CAP_READ | SND_SEQ_PORT_CAP_SUBS_READ | SND_SEQ_PORT_CAP_WRITE | SND_SEQ_PORT_CAP_SUBS_WRITE,
        SND_SEQ_PORT_TYPE_MIDI_GENERIC | SND_SEQ_PORT_TYPE_APPLICATION);
    return seq;
}

static void send_sysex(snd_seq_t *seq, int port, const char *line, int len) {
    unsigned char buf[300];
    if (len > (int)sizeof buf - 3) len = sizeof buf - 3;
    buf[0] = 0xF0; buf[1] = MAKER;
    for (int i = 0; i < len; i++) buf[2 + i] = (unsigned char)line[i] & 0x7F;
    buf[2 + len] = 0xF7;
    snd_seq_event_t ev;
    snd_seq_ev_clear(&ev);
    snd_seq_ev_set_source(&ev, port);
    snd_seq_ev_set_subs(&ev);
    snd_seq_ev_set_direct(&ev);
    snd_seq_ev_set_sysex(&ev, len + 3, buf);
    snd_seq_event_output_direct(seq, &ev);
}

static void send_cc(snd_seq_t *seq, int port, int channel, int controller, int value) {
    snd_seq_event_t ev;
    snd_seq_ev_clear(&ev);
    snd_seq_ev_set_source(&ev, port);
    snd_seq_ev_set_subs(&ev);
    snd_seq_ev_set_direct(&ev);
    snd_seq_ev_set_controller(&ev, channel & 15, controller & 0x7F, value & 0x7F);
    snd_seq_event_output_direct(seq, &ev);
}

/* A SysEx event of this maker, as its text; 0 if it is not one. */
static int sysex_text(const snd_seq_event_t *ev, char *out, int cap) {
    if (ev->type != SND_SEQ_EVENT_SYSEX) return 0;
    const unsigned char *p = ev->data.ext.ptr;
    int n = (int)ev->data.ext.len;
    if (n < 3 || p[0] != 0xF0 || p[1] != MAKER || p[n - 1] != 0xF7) return 0;
    int len = n - 3 < cap - 1 ? n - 3 : cap - 1;
    memcpy(out, p + 2, len);
    out[len] = 0;
    return 1;
}

static void line_out(snd_seq_t *seq, int port, const char *line) {
    send_sysex(seq, port, line, (int)strlen(line));
    unsigned parity, pole, dev, tick;
    if (sscanf(line, "reflect %2x %1u %2x %4x", &parity, &pole, &dev, &tick) == 4 && parity < 0x80)
        send_cc(seq, port, (int)tick, (int)parity, (int)((pole << 6) | (dev != 0)));
}

static int serve(const char *path) {
    int fd = open_serial(path), port;
    snd_seq_t *seq = open_seq("omi organ", &port);
    fprintf(stderr, "omi organ: serving %s as ALSA port %d:%d\n", path, snd_seq_client_id(seq), port);
    int nseq = snd_seq_poll_descriptors_count(seq, POLLIN);
    struct pollfd fds[8];
    char line[300]; int len = 0;
    for (;;) {
        fds[0].fd = fd; fds[0].events = POLLIN;
        snd_seq_poll_descriptors(seq, fds + 1, nseq, POLLIN);
        if (poll(fds, 1 + nseq, -1) < 0 && errno != EINTR) break;
        if (fds[0].revents & POLLIN) {
            char buf[256];
            int n = (int)read(fd, buf, sizeof buf);
            for (int i = 0; i < n; i++) {
                char c = buf[i];
                if (c == '\r') continue;
                if (c != '\n') { if (len < (int)sizeof line - 1) line[len++] = c; continue; }
                line[len] = 0;
                if (len) line_out(seq, port, line);
                len = 0;
            }
        }
        snd_seq_event_t *ev;
        while (snd_seq_event_input_pending(seq, 1) > 0 && snd_seq_event_input(seq, &ev) >= 0) {
            char text[300];
            if (sysex_text(ev, text, sizeof text)) {
                (void)!write(fd, text, strlen(text));
                (void)!write(fd, "\n", 1);
            }
        }
    }
    return 0;
}

/* A second client: connect both ways to "omi organ", then ask or listen. */
static int client(const char *ask, int listen_n) {
    int port;
    snd_seq_t *seq = open_seq("omi ask", &port);
    snd_seq_addr_t organ;
    if (snd_seq_parse_address(seq, &organ, "omi organ:0") < 0) { fprintf(stderr, "no omi organ port\n"); return 1; }
    snd_seq_connect_from(seq, port, organ.client, organ.port);
    snd_seq_connect_to(seq, port, organ.client, organ.port);
    if (ask) send_sysex(seq, port, ask, (int)strlen(ask));
    int seen = 0, answering = 0;
    time_t end = time(NULL) + 5;
    while (time(NULL) < end) {
        snd_seq_event_t *ev;
        if (snd_seq_event_input_pending(seq, 1) <= 0) { usleep(1000); continue; }
        if (snd_seq_event_input(seq, &ev) < 0) continue;
        char text[300];
        if (ask) {
            if (!sysex_text(ev, text, sizeof text)) continue;
            if (text[0] >= '1' && text[0] <= '9' && text[3] == ' ') answering = 1;
            if (answering) puts(text);
            if (answering && strcmp(text, "218 This is fine") == 0) return 0;
        } else {
            if (sysex_text(ev, text, sizeof text)) printf("sysex %s\n", text);
            else if (ev->type == SND_SEQ_EVENT_CONTROLLER)
                printf("cc channel %u controller %u value %d\n", ev->data.control.channel, ev->data.control.param, ev->data.control.value);
            else continue;
            if (++seen >= listen_n) return 0;
        }
    }
    return 2;
}

int main(int argc, char **argv) {
    if (argc == 3 && strcmp(argv[1], "--ask") == 0) return client(argv[2], 0);
    if (argc == 3 && strcmp(argv[1], "--listen") == 0) return client(NULL, atoi(argv[2]));
    return serve(argc > 1 ? argv[1] : "/dev/ttyUSB0");
}
