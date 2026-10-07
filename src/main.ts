import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div id="loading">
    <div>
      <div>
            <canvas id="uu" tabindex="0"></canvas>
      	      <canvas id="uk" tabindex="1"></canvas>
	      	<canvas id="ku" tabindex="2"></canvas>
		<canvas id="kk" tabindex="3"></canvas>
	</div>
    </div>
  </div>
<button id="screenshot" type="button">Save...</button>
`