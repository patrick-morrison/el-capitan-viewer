import './style.css';
const form=document.querySelector('#unlock'),input=document.querySelector('#password'),message=document.querySelector('#gate-message');let loading=false;
async function openViewer(){if(loading)return;loading=true;input.blur();try{await import('./src.js');document.querySelector('#gate').hidden=true;const app=document.querySelector('#app');app.hidden=false;app.inert=false;requestAnimationFrame(()=>{window.scrollTo(0,0);window.dispatchEvent(new Event('resize'));document.querySelector('#home').focus({preventScroll:true})});}catch(e){message.textContent='Could not load the viewer. Please try again.';loading=false;console.error(e)}}
form.addEventListener('submit',e=>{e.preventDefault();if(input.value.trim().toLowerCase()==='girt'){message.textContent='Loading…';openViewer()}else{message.textContent='Please try again.';input.select()}});

let resizeFrame;window.visualViewport?.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')))});
