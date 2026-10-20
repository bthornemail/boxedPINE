Abstract
This document provides advice for the use of XHTML or HTML markup and CSS to create pages for languages that use right-to-left scripts, such as Arabic and Hebrew. It attempts to counter many of the misunderstandings or over-complexities that currently abound. It also offers advice to those preparing content that will be localized into scripts that behave like Arabic and Hebrew.

Status of this Document
This document is an editors' copy that has no official standing.

This section describes the status of this document at the time of its publication. Other documents may supersede this document. A list of current W3C publications and the latest revision of this technical report can be found in the W3C technical reports index at http://www.w3.org/TR/.

This is a W3C Working Group Note produced by the Internationalization Core Working Group, part of the W3C Internationalization Activity. It is a draft document that may not fully represent the consensus of the group at this time. The Working Group expects to advance this Working Draft to Working Group Note.

This document is one of a planned series of documents providing HTML authors with best practices for developing internationalized HTML using XHTML 1.0 or HTML 4.01, supported by CSS1, CSS2 and some aspects of CSS3.

The document provides advice on practical techniques related to the creation of content in scripts such as Arabic and Hebrew, or content in other languages that includes fragments of these languages.

A new version of the Working Draft has been published at this time to provide the public with a snapshot of the current editorial work.

The Task Force encourages feedback about the content of this document (as well as participation in the development of the best practice by people who have experience creating Web content that conforms to internationalization needs). Please send comments related to this document to www-international@w3.org (public archive).

The Internationalization Working Group will not allow early implementation to constrain its ability to make changes to this specification prior to final release. Publication as a Working Draft does not imply endorsement by the W3C Membership. This is a draft document and may be updated, replaced or obsoleted by other documents at any time. It is inappropriate to cite this document as other than work in progress.

This document was produced by a group operating under the 5 February 2004 W3C Patent Policy. The group does not expect this document to become a W3C Recommendation. W3C maintains a public list of any patent disclosures made in connection with the deliverables of the group; that page also includes instructions for disclosing a patent. An individual who has actual knowledge of a patent which the individual believes contains Essential Claim(s) must disclose the information in accordance with section 6 of the W3C Patent Policy.

Table of Contents
1 Introduction
1.1 Who should use this document
1.2 How to use this document
1.3 Technologies addressed
1.4 Editorial notes
2 Important concepts
2.1 Bidirectional (or bidi) text
2.2 Relationships between language and directionality
3 Problems with bidirectional source text
3.1 Working with markup
3.2 Adding escapes to the content
3.3 Example source text in this document
4 Avoiding 'right' and 'left' in markup
Avoid attributes with values of 'right' and 'left'
5 Using CSS and bidi
Do not use CSS styling for HTML
Use a separate bidi style sheet for XML
6 Setting up a RTL page
Use dir on the html tag
Don't use visual ordering
7 Changing direction on block elements
Use the dir attribute on block elements.
Use bidi markup only when necessary.
8 Mixing text direction inline
Use RLM and LRM to place neutral characters
Use RLM and LRM to resolve same script ordering
Use the dir attribute inline
Use Unicode control characters for PCDATA
Watch out for white space
9 Handling parentheses & other mirrored characters
Treatment of mirrored characters
10 Overriding the Unicode bidirectional algorithm
Use the bdo element.
Appendix
A Acknowledgments
Go to the table of contents.1 Introduction
Go to the table of contents.1.1 Who should use this document
All HTML content authors working with XHTML 1.0, HTML 4.01, XHTML 1.1, and CSS.

The term 'author' is used in the sense described by the HTML 4.01 specification, ie. as a person or program that writes or generates HTML documents.

This document provides guidance for developers of HTML that enables support for international deployment. Enabling international deployment is the responsibility of all content authors, not just localization groups or vendors, and is relevant from the very start of development. Ignoring the advice in this document, or relegating it to a later phase in the development process, will only add unnecessary costs and resource issues at a later date.

It is assumed that readers of this document are proficient in developing HTML and XHTML pages - this document limits itself to providing advice specifically related to internationalization.

Go to the table of contents.1.2 How to use this document
This document is one of several relating to best practices for the design of Web content using W3C technologies.

If you are new to this topic you may wish to read the document from end to end, however, you will probably want to use the document later for reference purposes - dipping in to a particular section to find out how to perform a specific task with internationalization in mind.

Each best practice recommendation is summarized tersely. The text that follows that gives advice on how to implement the best practice, and provides additional explanations and discussion where appropriate. In some cases, the applicability of the recommendation may vary, depending on your aims and context. Where there are pros and cons for a given recommendation, we try to clearly indicate those.

Additional resources are pointed to at the end of each best practice. To check whether new resources have become available since the publication of this document, follow the links at the end of the resource sections to the techniques and topic indexes provided on the Internationalization section of the W3C site.

In the examples we show text in native scripts followed by an ASCII-only version for those who cannot see the originals correctly. This version uses transcriptions to represent the Hebrew or Arabic text, presented as you would see the text arranged on screen (so you read the transcriptions from right to left).

See also the note in Section 3.3: Example source text in this document about the difficulties of representing code examples, and the approach taken in the light of numerous possibilities.

Editorial notes have been left in this version of the document. [Ed. note: These are marked like this].

Go to the table of contents.1.2.1 User agent specific notes
User agents, in the current version of this document, means a number of mainstream browsers. (The scope may grow as resources and test results become available for other user agents.) [Ed. note: Note that this version of the Working Draft is not yet completely up to date in this area.]

If there is something you should know about how a best practice is supported by a particular user agent, we try to make that clear.

Small icons immediately after the initial statement of the best practice will indicate if there are notes you should read. The notes themselves appear in the descriptive text.

The user agents tested for the current document, their versions, and the icons used are as follows:

Internet Explorer 7 Internet Explorer icon

Internet Explorer 6 Internet Explorer icon

Firefox 2.0 Firefox icon

Opera 9.0 Opera icon

Netscape Navigator 8.1 Netscape icon

Safari 2.0 Safari icon

Detailed information may also be provided from time to time about behavior of a user agent in another version than the base or current versions.

Go to the table of contents.1.3 Technologies addressed
This document provides best practices for developing pages using HTML 4.01, XHTML 1.0 and XHTML 1.1 with CSS.

XHTML 1.0 can be served as XML (using MIME types application/xhtml+xml, application/xml or text/xml) or HTML (using the MIME type text/html). It is very common for XHTML 1.0 to be served as HTML, hopefully following the compatibility guidelines in Appendix C of the XHTML 1.0 specification. This allows authors to produce valid XML code, which has benefits for processing with scripts or XSLT, but is also well supported for display by most mainstream browsers. (Unlike XHTML served as application/xhtml+xml, which is not well supported by some browsers at the moment.)

In this document we want to reflect practical reality for content authors, so we cover XHTML served as text/html. All the examples (unless trying to make a specific point about HTML 4.01) are written in XHTML 1.0.

For XHTML served as XML, this document limits its advice to XHTML 1.1 documents served as application/xhtml+xml.

Where a browser operates in both standards- and quirks-mode, standards-mode is assumed (ie. you should use a DOCTYPE statement).

Go to the table of contents.1.4 Editorial notes
[Ed. note: add autoresizing and bidi mirroring info [[ http://lists.w3.org/Archives/Public/public-i18n-geo/2003Jan/0020.html]

[Ed. note: add information about Opera 7.2 support]

Go to the table of contents.2 Important concepts
Go to the table of contents.2.1 Bidirectional (or bidi) text
'Bidirectional', or 'bidi', text typically refers to text written using or including a script such as Arabic or Hebrew. In Arabic and Hebrew text the content flows predominantly from right to left, but embedded numbers or text in other scripts (such as Latin script) still runs left to right. Text in other languages, such as English, can also be bidirectional if it includes excerpts from languages such as Arabic and Hebrew.

Scripts such as Arabic and Hebrew, which are predominantly right-to-left in orientation, may also be referred to as 'RTL' (right-to-left) scripts.

Go to the table of contents.2.2 Relationships between language and directionality
Some people think that information about directionality can be inferred from information about the language of the text, but this is not true. There must be a one-to-one mapping between directionality and language for this to work, and there isn't. For example, Azerbaijani can be written using both right-to-left and left-to-right scripts, and the language code az is relevant for either.

In addition, when using directional markup inline, the markup and the values of that markup do not necessarily coincide with language declarations.

Also, markup used to indicate directionality has values that indicate that the normal directionality should be overridden; it is not possible to indicate that using language related values.

In the same way, attributes indicating text direction in HTML and XHTML do not, and should not, provide information about the language of text.

There exist already separate mechanisms for declaring language and directionality in HTML and XHTML, and these ideas should not be confused.

Other W3C best practices describe how to declare character encoding and language.

Go to the table of contents.3 Problems with bidirectional source text
There is currently a lack of good editing environments for creating HTML pages using right-to-left scripts. Because of the fact that HTML markup and escapes contain punctuation and strongly typed letters, you are always working with bidirectional source text. However, if the editor is not aware that the markup is not ordinary text (which is usually the case) it can produce some odd effects, and make coding difficult.

This section simply mentions some of those problems, so that you are forewarned. It doesn't propose a full solution, but it does offer some advice which may help with problematic editing environments.

Go to the table of contents.3.1 Working with markup
Unless your editor recognizes markup in source text as not being normal text, the strongly typed letters and punctuation in the markup will appear in places you wouldn't expect, and sometimes interfere with the order of the content itself.

If you are creating a large amount of right-to-left text, it makes sense to set the overall context of your editor to right-to-left. This helps ensure that the content is correctly ordered. Unfortunately, this tends to increase the likelihood that your markup looks strange in the source text.

Example 1 shows some simple markup in a left-to-right context.

Example 1: Markup being rearranged in ltr source code
<p class="myclass" title="العربي">مشس هخصث خهس تخت تخهثز.</p>

The source contains a p tag followed by a class attribute, followed by a title attribute with some Arabic text as its value. The content of the paragraph itself starts with Arabic text. The resulting order in a left-to-right environment (where Arabic text is indicated by text in square brackets) is

<p class="myclass" title="[paragraph_content]<"[title_value].</p>.

As Example 2 shows, things are hardly better if the overall context for the source code is right-to-left. In this case, the resulting order for the same source text is

<p/>[paragraph_content]<"[title_value"=p class="myclass" title>.

Example 2: Markup being rearranged in rtl source code
<p class="myclass" title="العربي">مشس هخصث خهس تخت تخهثز.</p>

Note, however, that this source will display correctly in a user agent. This is just a problem for reading and maintaining the source text.

The title attribute with Arabic text makes the situation much worse that normal in the above examples. The problem arises because there is only 'punctuation' between two runs of strongly-typed right-to-left text, so the Unicode bidirectional algorithm considers this to be a single run of text. It helps a little, if you can do it, to ensure that an attribute with a ltr value (ie. here the class attribute) appears last. This would make the text in a left-to-right context look as expected, and in a right-to-left context it would prevent the interaction of markup with content (see Example 3).

Example 3: Markup being rearranged in rtl source code
<p title="العربي" class="myclass">مشس هخصث خهس تخت تخهثز.</p>

If you are dealing with content that is predominantly in a right-to-left script, then, you need to look for a source editor that recognizes markup as a special construct, and produces a sensible order.

It can also help to start the content on a new line (see Example 4), however this doesn't always help with inline markup. Also, you should try to avoid including whitespace before the closing markup, as this can lead to other problems (see Best Practice 12: Watch out for white space).

Example 4: Starting content after a new line can separate attributes and content
<p class="myclass" title="العربي">

مشس هخصث خهس تخت تخهثز.</p>

Not only that, but if your markup includes a dir attribute to change the directional context of the content, your editor should recognize this and produce a corresponding change in the order of the source code.

Go to the table of contents.3.2 Adding escapes to the content
Note: See Best Practice 8: Use RLM and LRM to place neutral characters and Best Practice 9: Use RLM and LRM to resolve same script ordering for details about how escapes can be used to correctly order bidirectional inline text.

If you use a Unicode character for Unicode control characters such as the RIGHT TO LEFT MARK (RLM) or ZERO-WIDTH NON JOINER, you will not usually be able to see it in the source text, since it is invisible. For this reason you may think that a useful way to represent these characters is with the pre-defined HTML character entities, &rlm; and &zwnj;, or their numeric equivalents, &#x200E; and &#x200C;.

Unfortunately, such an approach typically has its problems, too. As described in the previous section related to markup in source text, the strongly-typed left-to-right characters and 'punctuation' characters in the escapes will normally cause the Unicode bidirectional algorithm to display very odd looking source text.

Very few editors currently recognize, for example, the sequence of characters &#x200E; as a single unit representing a character with a strong right-to-left direction. They treat this as simply text containing punctuation, numbers and two strongly-typed left-to-right characters (x and E), and apply the Unicode bidirectional algorithm to that as they would to any normal text.

Example 5 shows a typical view of source text after adding an escape to bidirectional text in right-to-left ordered source text. The sequence &#x200E; embedded in right-to-left text is displayed ;x200E#&. At the beginning or end of embedded English text the escape fragments to appear as x200E;text in english#& or ;text in english&#x200E, respectively.

Note that the source will still display correctly in a user agent. This is just a problem for reading and maintaining the source text.

Example 5: Escape sequences being rearranged in rtl source code
مشس&#x200E; هخصث خهس text in english تخت تخهثز.

مشس هخصث خهس &#x200E;text in english تخت تخهثز.

مشس هخصث خهس text in english&#x200E; تخت تخهثز.

Various approaches are possible, if you want to avoid using invisible characters:

use an editor that recognizes an escape as a single unit representing a RLM/LRM character and produces the expected effect on the surrounding source text

use an editor that provides a symbolic visual representation of the RLM/LRM character, so that you don't lose sight of it

break the source code line around the escape - works in some cases

learn to live with the undesirable reordering effects for escapes.

Go to the table of contents.3.3 Example source text in this document
Given the discussion above, representing examples of source text in this document can be quite difficult. Should we show source text in right-to-left order, or left-to-right? Should we assume that the editor recognizes and handles markup and escapes as separate entities from the content, and create source fragments that look like that - or should we show source as it really looks for many people who don't have such clever editors? And particularly, should we assume that the bidirectional algorithm is properly applied in the source editor, picking up cues from the markup, or not?

We will avoid source code examples unless they are very useful. We will try to describe how to apply the markup rather than show it.

We will typically represent examples in a left-to-right context, and use invisible markup to make content and markup look as you might expect it to be displayed by an intelligent editor, since this will provide maximum clarity about the point being made, even if it doesn't reflect how the markup will look for many people.

Go to the table of contents.4 Avoiding 'right' and 'left' in markup
Go to the table of contents.Best Practice 1: Avoid attributes with values of 'right' and 'left'
Whenever possible, avoid HTML attributes with values of right and left. Use CSS in a linked style sheet instead.
No UA applicability issues.
How to: Attributes in HTML 4.01 that have values of right and left are align and clear.

align is used with the elements hr, div, hX, p, col, colgroup, tbody, td, tfoot, th, thead and tr. clear is used with br.

For example, to right align a paragraph you could use the CSS rule in Example 6:

Example 6: 
p { text-align: right; }

(Note that this best practice does not refer to the values rtl and ltr that are used with the dir attribute.)

Discussion: Values of right and left in attributes need to be converted when translating the document into a language using the Arabic or Hebrew scripts. It can save a lot of time and risk to use CSS style sheets to achieve the same effect. One should expect the style sheet to be converted as part of the translation process.

Go to the table of contents.5 Using CSS and bidi
Go to the table of contents.Best Practice 2: Do not use CSS styling for HTML
Do not use CSS styling to control directionality in XHTML/HTML served as text/html. Use markup.
No UA applicability issues.
How to: Use the dir attribute when you need to indicate directionality. For more information about using this attribute see the rest of this document.

Discussion: Because directionality is an integral, and needs to be a persistent part of the document structure, markup should always be used to set the directionality for a document or chunk of information, or to indicate places in the text where the Unicode bidi algorithm is insufficient to achieve desired inline directionality.

For XHTML or HTML served as text/html (ie. treated as HTML by the user agent), the expected behavior of the dir attribute and its values is clearly defined in the HTML specification, so CSS is not needed. The CSS2 specification recommends the use of markup for bidi text in HTML. In fact it goes as far as to say that conforming HTML user agents may ignore CSS bidi properties. This is because the HTML specification clearly defines the expected behavior of user agents with respect to the bidi markup.

See CSS vs. markup for bidi support for a fuller explanation.

Background information
FAQ that answers the question, "Should I use CSS or markup to correctly format Unicode-based bidi text in HTML and XML-based markup languages?"
CSS vs. markup for bidi support
Sources

HTML 4 specification, section 8.2, Specifying the direction of text and tables: the dir attribute

Cascading Style Sheets, level 2 (CSS2) Specification, section 9.10, Text direction: the 'direction' and 'unicode-bidi' properties
More resources
Technique index - Topic index
Go to the table of contents.Best Practice 3: Use a separate bidi style sheet for XML
For XHTML served as text/html, keep bidi CSS in a separate style sheet.
No UA applicability issues.
How to: Use a separate link element to link to a style sheet containing only CSS statements to support the dir attribute.

Example 7 shows part of an XHTML 1.1 document head where the style sheet bidi.css contains all the properties needed to control the directionality set by the dir attribute values:

Example 7: 
<head>

...

<link rel="style sheet" href="myStyling.css" />

<link rel="style sheet" href="/styles/bidi.css" />

</head>

Example 8 shows what the file bidi.css might contain:

Example 8: 
*[dir="ltr"] { direction: ltr; unicode-bidi: embed }

*[dir="rtl"] { direction: rtl; unicode-bidi: embed }

bdo[dir="ltr"] { direction: ltr; unicode-bidi: bidi-override }

bdo[dir="rtl"] { direction: rtl; unicode-bidi: bidi-override }

Discussion: XHTML served as application/xhtml+xml, application/xml or text/xml is treated by user agents as XML, not HTML.

Normally a user agent will not automatically recognize or know what to do with any bidi markup you use in XML documents. CSS properties should therefore be used to indicate the expected visual behavior of text in your document. (Note that this is not the case for documents served as HTML, see Best Practice Best Practice 2: Do not use CSS styling for HTML.)

Keeping the relevant CSS in a separate style sheet is not essential, but it may help in a number of ways:

this single style sheet can be used with all the other style sheets on your site

the text is less likely to be accidentally changed or omitted when changes are made to the style sheet or a new style sheet is created

if the user turns off style, switches styles or overrides the styling, it is sometimes possible to do so selectively - in which case the bidi styling can be left alone.

The CSS, however, should always be linked to dedicated bidi markup in the text.

See CSS vs. markup for bidi support for a fuller explanation.

Background information
FAQ that answers the question, "Should I use CSS or markup to correctly format Unicode-based bidi text in HTML and XML-based markup languages?"
CSS vs. markup for bidi support
Sources

HTML 4 specification, section 8.2, Specifying the direction of text and tables: the dir attribute

Cascading Style Sheets, level 2 (CSS2) Specification, section 9.10, Text direction: the 'direction' and 'unicode-bidi' properties
More resources
Technique index - Topic index
Go to the table of contents.6 Setting up a RTL page
Go to the table of contents.Best Practice 4: Use dir on the html tag
Add dir="rtl" to the html tag any time the overall document direction is right-to-left.
UA applicability issues for:   ie6   ie7  
How to: Add dir="rtl" to the html tag any time the overall document direction is right-to-left.

Example 9: 
<html dir="rtl" xml:lang="ar" lang="ar">

This will cause block elements and table columns to start on the right and flow from right to left. All block elements in the document will inherit this setting unless it is explicitly overridden.

No dir attribute is needed for documents that have a base directionality of ltr, since this is the default.

Having established the directionality at level of the html tag, you should not use the dir attribute on other elements unless you want to change the directionality for that element. Unnecessary use of the dir attribute impacts bandwidth and potentially creates unnecessary additional work for page maintenance (see Best Practice Best Practice 7: Use bidi markup only when necessary.).

Discussion: Note that in Internet Explorer, applying a right-to-left direction in the html or body tag will affect the user interface, too.

The scroll bar will appear to the left side of the window, and JavaScript alert message boxes such as the one shown on the slide will be mirror imaged (see the tests). (Note how the yellow icon on the slide appears on the right, and the logical order of the text, <arabic> W3C <hebrew>, is displayed from right to left.) This behavior does not occur in other browsers.

Some speakers of languages that use right-to-left scripts prefer the directionality of the user interface to be associated with the desktop environment, not with the content of a particular document. Because of this, they may prefer not to declare the document directionality on the html or body tag. To avoid this without tagging every block element in the document you could add a div element immediately inside the body element that surrounds all the other content in the document, and apply the dir attribute to that. The directionality will then be inherited by all other block elements in the body of the document, but will not set off the changes to the browser. If you do this, you must ensure that you add a dir attribute to the head element also, to cover its title element, attribute values, etc.

UA issues: The following summarizes support for this feature in the user agents tested for this document at the time of writing. See the test results page for more details and latest results.

In Internet Explorer adding the dir attribute to the html tag also moves the scroll bar to the left of the browser window. See the discussion immediately above for the implications of this.

According to the Microsoft article Authoring HTML for Middle Eastern Content, the following behaviors can only be expected in Internet Explorer 5 if the dir attribute is on the html element, rather than the body element.

The OLE/COM ambient property of the document is set to AMBIENT_RIGHTTOLEFT

The document direction can be toggled through the document object model (DOM) (document.direction="ltr/rtl")

An HTML Dialog will get the correct extended windows styles set so it displays as a RTL dialog on a Bidi enabled system.

If the document has vertical scrollbars, they will be used on the left side if dir="rtl".

Reference links
Explains why you should add dir to the html element rather than the body element.
Authoring HTML for Middle Eastern Content
More resources
Technique index - Topic index
Go to the table of contents.Best Practice 5: Don't use visual ordering
Use logical order, not visual ordering for Hebrew, and choose an appropriate encoding.
No UA applicability issues.
How to: Create and store your Hebrew content in logical order (ie. usually as you would pronounce it), not the order you expect to see it displayed. It is usually best to use an Unicode encoding, such as UTF-8. If, for some reason, you choose to serve your Hebrew page in an ISO encoding instead, then specify ISO-8859-8-I, not ISO-8859-8.

Discussion: 'Visual ordering' of text was common for old user agents that didn't support the Unicode bidirectional algorithm. Text was stored in the source code in the same order you would expect to see it displayed. This also involved such things as disabling any line wrapping, explicit right-alignment of text in paragraphs and table cells, and reverse-ordering of table columns when translating from English to a language using a bidi script. For example, if you want to add a few words in the middle of a paragraph, you would have to move text to and from every line that followed it in the paragraph (see the tutorial Creating (X)HTML Pages in Arabic & Hebrew for an example).

Note, too, that if you have in-line markup, such as emphasis or link text, that spans more than one line, you will need to mark up the text runs on both lines separately. Again, adding text before such markup in a paragraph would mean that you have to carefully change this markup to reflect the new position of the text.

The result is very fragile code that is difficult to maintain. In addition, all the extra tags needed to manage the text would bloat your code and impact not only authoring time, but also bandwidth. Visually ordered bidirectional HTML does not conform to the HTML specification.

Using logically ordered text, on the other hand, makes it almost trivial to create long paragraphs of flowing text that automatically wrap to the width of the block element. It also makes it much easier to address accessibility, using such things as screen readers.

With 'logical ordering' text is stored in memory in the order in which it would normally be typed (and usually pronounced). The Unicode bidirectional algorithm is then applied by the browser to render the correct visual display.

Note: Visual ordering isn't really seen much for Arabic. Since the Arabic letters are all joined up there was a stronger motivation on the part of Arabic implementers to enable the logical ordering approach.

Certain encodings are associated with visual vs. logical ordering of text. Text in a Unicode encoding, such as UTF-8, is always logical.

According to RFC1555 and RFC1556, there are special conventions for the use of charset parameter values to indicate bidirectional treatment in MIME mail, in particular to distinguish between visual, implicit, and explicit directionality. 'Visual' refers to the practice of typing in the Hebrew characters in reverse order and preventing automatic line breaks. Formatting the document visually in this way is typically done to ensure reasonable display on older user agents that do not handle bidirectionality. Such documents do not conform to the HTML specification. 'Implicit' is also called logical ordering, and refers to an approach where all characters in memory in the order in which it would normally be typed. Correct ordering for display is then done by a special algorithm (this is the preferred approach). 'Explicit' refers to the use of explicit markers in the text to indicate directional changes.

The charset parameter value ISO-8859-8 for Hebrew denotes visual ordering, ISO-8859-8-I denotes implicit bidirectionality, and ISO-8859-8-e denotes explicit directionality.

Because HTML uses the Unicode bidirectional algorithm, conforming documents encoded using ISO 8859-8 must be labeled as ISO-8859-8-I. Explicit directional control is also possible with HTML, but cannot be expressed with ISO 8859-8, so "ISO-8859-8-e" should not be used.

Contrary to what is said in RFC1555 and RFC1556, ISO-8859-6 (Arabic) is not visual ordering.

Note, also, that ISO encodings don't include diacritics - if you want these use a logical encoding such as a Unicode encoding or Windows-1255.

Background information
Provides examples and explanations of visual versus logical order for pages in bidirectional scripts.
What you need to know about the bidi algorithm and inline markup, Visual vs. logical order
Reference links

Hebrew Character Encoding for Internet Messages

Handling of Bidirectional Texts in MIME
Sources
Describes why to choose iso-8859-8-I.
8.2.4 Overriding the bidirectional algorithm: the BDO element, Note on Bidirectionality and character encoding
More resources
Technique index - Topic index
Go to the table of contents.7 Changing direction on block elements
Go to the table of contents.Best Practice 6: Use the dir attribute on block elements.
Add the dir attribute to a block level element (only) to change its directionality.
UA applicability issues for:   ie6  
How to: Add the dir attribute to a block level element where you want to change its directionality. Example 10 shows how you might mark up a blockquote element to render a left-aligned English quote in a right-to-left page.

Example 10: Switching a block to left-to-right on a right-to-left page.
<blockquote dir="ltr" xml:lang="en" lang="en" cite="Romeo and Juliet (II, ii, 1-2)">But, soft! What light through yonder window breaks? It is the east, and Juliet is the sun.</blockquote>

If you want to align a table to the left or right of a page, rather than just change the order of its columns and contents, you need to put the table in a div element, and add the dir attribute to that, rather that put the attribute on the table element.

Note also that you should only use the dir attribute on block elements when you need to change the directionality from the current default (see Best Practice Best Practice 7: Use bidi markup only when necessary.).

Discussion: The following example illustrates the effect of applying a change in directionality to a block level element using the dir attribute.

Example 11 inherits the LTR directionality of this page, and its source contains some Hebrew text, followed by punctuation, followed by a graphic.

Example 11: Order of elements in a left-to-right paragraph.
להוביל את הרשת למיצוי הפוטנציאל שלה…  Small picture of a globe.

Visual ASCII version: 

hls lajtsntvph jvtsjml tsrh ta ljbvhl...  Small picture of a globe.

Example 12 is exactly the same code, but with an explicit dir="rtl" added to the paragraph tag to turn this into a right-to-left paragraph embedded in this left-to-right page.

Example 12: Order of elements in a right-to-left paragraph.
להוביל את הרשת למיצוי הפוטנציאל שלה…  Small picture of a globe.

Visual ASCII version:

 Small picture of a globe. ...hls lajtsntvph jvtsjml tsrh ta ljbvhl

Note, in particular, that the positions of the image and punctuation in the example above change relative to the text, because the overall directional flow has been changed. Note also, however, that the Hebrew characters are still read in the same direction. Their sequence is determined by the Unicode bidirectional algorithm, not by the dir attribute.

The content of all nested block elements will inherit directionality (unless of course a nested element explicitly changes its directionality using dir). Remember that the base directionality for a document should already be established by the html element. There is no need to add dir attributes to block level elements unless you want to apply a different direction to that set by the html tag or an explicit setting on a parent block element.

Visual user agents that support bidirectional display will typically right-align block elements in a rtl context, and vice versa. (See the example above.)

The dir attribute setting also affects the flow of columns in a table.

The table element in Example 13 has a dir attribute set to rtl.

Example 13: Table element with dir set to rtl.
1	2	3
مكتب W3C הישראלי	مكتب W3C הישראלי	مكتب W3C הישראלי
Visual ASCII version:

3	2	1
hebrew W3C arabic	hebrew W3C arabic	hebrew W3C arabic
Example 14 shows the same table element with the dir attribute removed. The directionality of the columns is now set by the next ancestor element that specifies directionality - in this case the default ltr setting of the html tag of this document.

Example 14: Table element with no dir attribute set.
1	2	3
مكتب W3C הישראלי	مكتب W3C הישראלי	مكتب W3C הישראלי
Visual ASCII version:

1	2	3
arabic W3C hebrew	arabic W3C hebrew	arabic W3C hebrew
Note how the cells inherit the directionality set for the table. This produces the alignment of text in the cell, the order of text relative to the number, and the position of the question mark.

Note also that in most browsers, unlike other block elements, adding a dir attribute to the table will not cause the table to be aligned differently. It will only affect the order of columns and table content. If you want the table to be aligned with the other side of the content area you will need to wrap the table in another block element (eg. a div) that carries a dir attribute.

UA issues: [Ed. note: dir causes problem on DT element in IE6]

Go to the table of contents.Best Practice 7: Use bidi markup only when necessary.
Only use bidi markup where it is needed.
No UA applicability issues.
How to: Once you have established the appropriate directionality for the html element you will only need to apply bidi markup to a block element if you want that element's directionality to be different. The same applies for inline markup. Do not use inline bidi markup unless the Unicode bidi algorithm is insufficient on its own.

The following Arabic example shows bad usage. None of the dir attributes are needed if dir="rtl" was added to the html element. Removing them will significantly simplify the document and reduce bandwidth requirements.

Example 15: Bad practice. Do not copy!
<h2 dir="rtl">القاموس</h2>

<dl>

<dt dir="rtl">المنالية</dt>

<dd dir="rtl">سهولة منال للويب من قبل الجميع بصرف النّظر عن إعاقةهم . </dd>

<dt dir="rtl">برنامج التصديق</dt>

<dd dir="rtl">

أو "الفاليديتور" أداة للتّحقّق من صلاحيّة صفحة ويب. على سبيل المثال، للتّحقّق من صلاحيّة

<span dir="ltr">HTML</span> ، يمكن أن تستخدم بزنامج تصديق

<span dir="ltr">W3C</span>

</dd>

<dt dir="rtl">التّدويل</dt>

<dd dir="rtl">

تدويل الويب يسمح و يجعله سهل لاستخدام موقعك باللّغات و السّيناريوهات و الثّقافات المختلفة.

</dd>

</dl>

The Unicode Bidirectional Algorithm is applied to text that is stored in logical order, and determines the appropriate display direction of a sequence of characters. It does this on the basis of semantics associated with those characters by the Unicode Standard.

The following Arabic text in example 16 contains the number 1996 that runs left to right within the overall right to left flow of the Arabic letters. No special markup or styling is needed to achieve this. The bidirectional algorithm alone is enough.

Example 16: The number '1996' is automatically rendered left-to-right without markup.
بدأ تطوير إكس إم إل في 1996 و صارت...

Visual ASCII version:

...traS w 1996 iq la ma ska jiwTt and

Occasionally the Unicode bidirectional algorithm is not sufficient to correctly order chunks of embedded text. Alternatively, you may want to override the effects of the bidirectional algorithm for a part of the page. In these cases you can apply additional markup to produce the ordering you want.

Background information
Provides examples and explanations of visual versus logical order for pages in bidirectional scripts.
What you need to know about the bidi algorithm and inline markup, Visual vs. logical order
More resources
Technique index - Topic index
Go to the table of contents.8 Mixing text direction inline
Go to the table of contents.Best Practice 8: Use RLM and LRM to place neutral characters
Use a Unicode right-to-left mark (RLM) or left-to-right mark (LRM) to make neutral characters such as punctuation and spaces appear in the right place when they fall between different directional runs.
No UA applicability issues.
How to: Where punctuation or other 'neutral characters' occurring between LTR and RTL text do not display in the expected location, place a RIGHT-TO-LEFT MARK (Unicode character U+200F) or a LEFT-TO-RIGHT MARK (Unicode character U+200E) alongside the misplaced character or characters to produce the desired result. (For explanations with examples see the discussion below.)

These characters can be added as characters or as escapes. (But see the issues associated with escapes at Section 3.2: Adding escapes to the content.)

Discussion: You need to be familiar with the concepts in What you need to know about the bidi algorithm and inline markup to understand this best practice.

Unfortunately, the bidirectional algorithm may not always produce the desired result with regard to the placement of punctuation. For instance, the overall context of the example below is LTR. If we introduce some punctuation between the Arabic and Latin letters it will produce the (undesirable) result in Example 17.

The exclamation mark is part of the Arabic phrase and should have appeared to its left. It appears to the right because it is between an Arabic and Latin character and the overall paragraph direction is LTR. It is therefore treated as part of the English text.

Example 17: Undesirable result, without directional marks.
The title is "مفتاح معايير الويب!" in Arabic.

Visual ASCII version:

The title is "biula riiacm Hatfm!" in Arabic.

An easy way to fix this is to insert the Unicode character U+200F, called the RIGHT-TO-LEFT MARK (RLM), after the exclamation mark.

Now with two strong RTL characters on either side, the exclamation mark too will be treated as part of the RTL directional run and we will get the following (correct) result.

Example 18: Correct result, using a RLM directional mark.
The title is "مفتاح معايير الويب!‏" in Arabic.

Visual ASCII version:

The title is "!biula riiacm Hatfm" in Arabic.

You could encounter a similar problem in an Arabic paragraph that included English text followed by an exclamation mark. There is a similar character, U+200E, called the LEFT-TO-RIGHT MARK (LRM) which would solve the problem in this case.

Go to the table of contents.Best Practice 9: Use RLM and LRM to resolve same script ordering
Use a Unicode right-to-left mark (RLM) or left-to-right mark (LRM) to correctly order separate runs of same direction text separated by neutral characters such as punctuation and spaces.
No UA applicability issues.
How to: This best practice is relevant when the placement of some punctuation or other neutral characters in between two runs of text with the same directionality causes the text to be incorrectly ordered. (For explanations with examples, see the discussion below.)

If the overall directional context is right-to-left, place a RIGHT-TO-LEFT MARK (Unicode character U+200F) alongside the neutral characters to produce the desired result. Otherwise use a LEFT-TO-RIGHT MARK (Unicode character U+200E).

These characters can be added as characters or as escapes. (But see the issues associated with escapes at Section 3.2: Adding escapes to the content.)

Note that the dir attribute is not appropriate to resolve this case.

Discussion: You need to be familiar with the concepts in What you need to know about the bidi algorithm and inline markup to understand this best practice.

In Example 19 there is a comma between two of the state names written in Arabic script. With a strongly typed right-to-left (RTL) character on either side, the bidirectional algorithm sees the neutral comma as part of the Arabic text. Therefore, the first two Arabic words are treated as a single directional run, going right to left. This leads to a reading sequence of:

(ltr) The names of these states in Arabic are

(rtl) مصر, البحرين [nirHbla ,rSm]

(ltr) and

(rtl) الكويت [tiukla]

(ltr) respectively.

Example 19: Undesirable result, without directional marks.
The names of these states in Arabic are مصر, البحرين and الكويت respectively.

Visual ASCII version:

The names of these states in Arabic are nirHbla ,rSm and tiukla respectively.

The comma, however, is really part of the English text. So what is wanted is this order, as shown in Example 20:

(ltr) The names of these states in Arabic are

(rtl)مصر [rSm]

(ltr) ,

(rtl) البحرين [nirHbla]

(ltr) and

(rtl) الكويت [tiukla]

(ltr) respectively.

Example 20: The corrected result, using directional marks.
The names of these states in Arabic are مصر,‎ البحرين and الكويت, respectively.

Visual ASCII version:

The names of these states in Arabic are rSm, nirHbla and tiukla respectively.

The correct result was obtained by simply placing a LEFT-TO-RIGHT MARK (Unicode character U+200E) immediately after the comma. This has the effect of placing the neutral comma between two strongly typed characters, one left-to-right and the other right-to-left. Because neutral characters in this position take on the directionality of the overall context (here that of the paragraph), the bidi algorithm will now see it as part of the English left-to-right flow and will see the two Arabic words as separate.

In Example 21, this time in a right-to-left Hebrew paragraph, the beginning (ie. the right hand side) of the sentence looks a real mess. This is because the text from "W3C" to "Consortium" is seen as a single directional run of LTR characters. The second parenthesis from the right falls between LTR and RTL characters, so assumes the directionality of the paragraph - RTL.

Example 21: Undesirable result, without directional marks.
W3C - (World Wide Web Consortium) מעביר את שירותי הארחה באירופה ל - ERCIM.

Visual ASCII version:

.ERCIM - l hpvrjab hxrah jtvrjs ta rjb*m (W3C - (World Wide Web Consortium

It is very simple to obtain the correct result. Simply put a RIGHT-TO-LEFT MARK (Unicode character U+200F) immediately after the hyphen. This causes the hyphen and the nearby parenthesis to be seen as part of the paragraph's text flow, as shown in Example 22.

Example 22: The corrected result, using directional marks.
W3C -‏ (World Wide Web Consortium) מעביר את שירותי הארחה באירופה ל - ERCIM.

Visual ASCII version:

.ERCIM - l hpvrjab hxrah jtvrjs ta rjb*m (World Wide Web Consortium) - W3C

It is probably worth adding one more example to this discussion. Where lists are composed from separate items, separated by punctuation or spaces, you may also need to think of adding an RLM or LRM.

Example 23: A list containing two separate LTR items on a RTL page.
Picture of the top of an article written in Hebrew, showing a list of translations, using the name of the language in the native script, in Arabic, English and French.

The list of translated versions at the top right of the Hebrew page in Example 23 needs to read in the order Arabic, English and French (from right to left). On the English page this list is created by simply concatenating the names of the language in the desired order. Do that on the Hebrew or Arabic pages, however, and the order of display will be Arabic, French, English - since the bidirectional algorithm treats the two Latin words as a single directional run. The PHP code that produces the list needs to insert an RLM character between each Latin language name in order to achieve the appropriate ordering. Note how this requires a change to the logic of the script in this case.

Go to the table of contents.Best Practice 10: Use the dir attribute inline
Use the dir attribute on an inline element to resolve problems with nested directional runs.
No UA applicability issues.
How to: Add the dir attribute to an element surrounding the embedded text. If there is no element surrounding the text, use a span element.

Set the value of the dir attribute to either ltr or rtl, depending on the main direction of the embedded text.

For examples and more detailed explanations see the discussion that follows.

Discussion: You need to be familiar with the concepts in What you need to know about the bidi algorithm and inline markup to understand this best practice.

This best practice is particularly useful where embedded text, such as a quote, is bidirectional. At a simple level the Unicode bidirectional algorithm takes care of the reordering of inline text, but where there is nesting of directionality the dir attribute may need to be used.

The Unicode bidirectional algorithm organizes characters into directional runs - sequences of characters with the same directionality. Directionally neutral characters such as spaces and punctuation take on the directionality of surrounding characters, allowing directional runs to span several words. In Example 24 there are three directional runs - English, Arabic, and English. These are ordered according to the prevailing directionality of the paragraph - in this case left-to-right.

Example 24: A sentence with three directional runs.
The title is مفتاح معايير الويب in Arabic.

Visual ASCII version:

The title is biula riiacm Hatfm in Arabic.

Unfortunately, the bidirectional algorithm alone does not produce the desired result if one of the directional runs contains mixed direction text, as can be seen in the following example.

Example 25: Undesirable result, without directional marks.
The title says "פעילות הבינאום, W3C" in Hebrew.

Visual ASCII version:

The title says "mvanjbh tvlj*p, W3C" in Hebrew.

The incorrect line of text in Example 25 is coded as a simple sequence of characters without any inline markup. Note that the order of the two Hebrew words is correct, but the text "W3C" should appear on the left hand side of the quotation and the comma should appear between the Hebrew text and "W3C", as shown in Example 26.

Example 26: Undesirable result, without directional marks.
The title says "פעילות הבינאום, W3C" in Hebrew.

Visual ASCII version:

The title says "W3C, mvanjbh tvlj*p" in Hebrew.

To get the correct result we have to create a new 'embedding level' by surrounding the text within the quote marks with a span element and setting its dir attribute to rtl as shown in Example 27. (The language attributes have been omitted to make the example clearer. See also the issues associated with representing source text at Section 3.3: Example source text in this document)

Example 27: 
<p>The title says "<span dir="rtl">פעילות הבינאום, W3C</span>" in Hebrew.</p>

Visual ASCII version:

<p>The title says "<span dir="rtl">W3C, mvanjbh tvlj*p</span>" in Hebrew.</p>

This causes the comma to take on the same RLT directionality as the whole span, and orders the Hebrew directional runs appropriately.

Note that we have used a span element to carry the dir attribute in this case. If the quote had already been surrounded by an element, the dir attribute should be attached to that. A span element should only be used where there is nothing else available.

Note also that we placed the span element inside the quotation marks, since these are a part of the English text.

Go to the table of contents.Best Practice 11: Use Unicode control characters for PCDATA
Unicode control characters for bidirectional control only for attribute text or element text that allows no internal markup.
No UA applicability issues.
How to: In (X)HTML do not use the Unicode bidi formatting code characters where markup is available. To show the limits of embedded text with a different default direction, use the dir attribute, and to override the bidirectional algorithm use the bdo element.

Note: Two invisible but non-embedding directional control characters provided by Unicode do not have corresponding markup and should be used. These are U+200F RIGHT-TO-LEFT MARK and U+200E LEFT-TO-RIGHT MARK (LRM).

On the other hand, attribute text and element text that allows no internal markup, ie. the title, textarea and option elements, cannot support use of dir on a span or other element to label part of its content.

In these cases you can use Unicode characters to do the same job. The following table shows correspondences between markup and Unicode control codes:

Markup	Code	Codepoint	Description
dir = "rtl"	RLE	U+202B	Same effect as the start tag of a block or inline element with the attribute dir set to rtl .
dir = "ltr"	LRE	U+202A	Same effect as the start tag of a block or inline element with the attribute dir set to ltr .
<bdo dir = "rtl">	RLO	U+202E	Same effect as the start tag of a bdo element with the attribute dir set to rtl .
<bdo dir = "ltr">	LRO	U+202D	Same effect as the start tag of a bdo element with the attribute dir set to ltr .
end of selection	PDF	U+202C	When used to terminate RLE or LRE it is equivalent to the end tag of the element carrying the dir attribute. When used to terminate RLO or LRO it is equivalent to the </bdo> tag.
These characters can be added as characters or as escapes. (But see the issues associated with escapes at Section 3.2: Adding escapes to the content.)

Note: These Unicode characters can be used anywhere, but their use in other areas where markup is available is not recommended. (See the article Bidi formatting codes vs. markup in (X)HTML.)

Discussion: The HTML 4 specification specifically warns against mixing the two approaches because of the increased likelihood of improper nesting. It also recommends the use of markup because it "offers a better guarantee of document structural integrity and alleviates some problems when editing bidirectional HTML text with a simple text editor". It does not proscribe the use of Unicode bidi formatting codes.

The joint Unicode Technical Report #20 and W3C Note, Unicode in XML and other Markup Languages goes further. It explicitly recommends that only the markup be used. It also recommends that the Unicode bidi formatting codes should be ignored if detected in a browser context, and replaced by appropriate markup when received in an editing context.

Of course, in attribute values or for the three elements listed above markup cannot be used, so the Unicode control characters are the only option available.

Sources
Advice in Unicode in XML and other Markup Languages, a joint Unicode Technical Report #20 and W3C Note (section 3.4).
Bidi Embedding Controls (LRE, RLE, LRO, RLO, PDF), U+202A .. U+202E
Advice in HTML 4.01 spec (section 8.2.3) .
Setting the direction of embedded text
Advice in the CSS2 spec (section 9.10).
Text direction: the 'direction' and 'unicode-bidi' properties
More resources
Technique index - Topic index
Go to the table of contents.Best Practice 12: Watch out for white space
Do not leave white space at the end of inline elements that mark a directional boundary.
No UA applicability issues.
[Ed. note: Summarize and point to the bidi space Q&A]

Sources
W3C Internationalization FAQ: Why does my browser collapse spaces between Latin and Arabic/Hebrew text?
Bidi space loss
More resources
Technique index - Topic index
Go to the table of contents.9 Handling parentheses & other mirrored characters
Go to the table of contents.Best Practice 13: Treatment of mirrored characters
Treat mirrored characters as if any word left in the name meant 'opening', and right meant 'closing'.
No UA applicability issues.
The shape of the glyphs used for a pair of mirrored characters will be determined at run time according to the directional context in which they appear.

Go to the table of contents.10 Overriding the Unicode bidirectional algorithm
Go to the table of contents.Best Practice 14: Use the bdo element.
Use the bdo element to force the directionality of a sequence of inline characters.
No UA applicability issues.
bdo stands for 'bidirectional override'. This inline element can be used to override the Unicode bidirectional algorithm if the dir attribute doesn't produce the desired result or if you want to produce a different result.

You can illustrate the order of characters as stored in memory in examples by simply applying a bdo tag to the example text. This causes the characters to flow in one direction, regardless of the directionality of the characters involved.

For instance, in the normal case the Unicode bidirectional algorithm would operate on Hebrew text to produce the result shown in example 28. Note how the characters in the Hebrew words are read right to left.

Example 28: Hebrew automatically runs right-to-left.
The Hebrew text is פעילות הבינאום.

Visual ASCII version:

The Hebrew text is mvanjbh tvlj*p.

If, however, you wanted to produce an example showing the sequence in which characters are stored in the computer's memory such as in example 29 ...

Example 29: The bdo tag can force Hebrew text to run left to right.
The order of characters in the Hebrew text is פעילות הבינאום.

Visual ASCII version:

The order of characters in the Hebrew text is p*jlvt hbjnavm.

... you can do so using the following underlying code

Example 30: Code for the previous example.
<p>The order of characters in the Hebrew text is <bdo dir="ltr">פעילות הבינאום</bdo>.</p>

Visual ASCII version:

<p>The order of characters in the Hebrew text is <bdo dir="ltr">mvanjbh tvlj*p</bdo>.</p>

Go to the table of contents.A Acknowledgments
The following members of the GEO Working Group and the former GEO Task Force have contributed their time and valuable comments to shaping these guidelines:

Phil Arko (Siemens), Steve Billings, Deborah Cawkwell (BBC World Service), Wendy Chisholm (W3C WAI), Andrew Cunningham (State Library of Victoria), Martin Dürst (W3C), Lloyd Honomichl, Russ Rolfe (Microsoft), Peter Sigrist, Tex Texin (Yahoo), Najib Tounsi (Ecole Mohammadia d'Ingénieurs)