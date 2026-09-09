(function () {
  'use strict';
  const requestedId = new URLSearchParams(location.search).get('design') || 'b1';
  const previewId = /^b[1-5]$/.test(requestedId) ? requestedId : 'b1';
  const id = 'a' + previewId.slice(1);
  let previewDevice = new URLSearchParams(location.search).get('device') === 'mobile' ? 'mobile' : 'desktop';
  const isFramed = window.parent !== window;
  const sessionKey = 'cherry-together-preview-' + previewId + '-v1';
  const design = ['a1','a2','a3','a4','a5'].includes(id) ? id : 'a1';
  document.body.className = 'design-' + design;
  const root = document.getElementById('app');
  const dialog = document.getElementById('app-dialog');
  let state = {step:0, answers:{}, completed:false, editingDate:null};
  const initialRecords = {9:{0:4,1:'No',2:3,3:'No',4:2},10:{0:3,1:'No',2:2,3:'No',4:2},11:{0:5,1:'Yes',2:4,3:'No',4:3}};
  let records = structuredClone(initialRecords);
  let drafts = {};
  try {
    const saved = JSON.parse(sessionStorage.getItem(sessionKey));
    if (saved?.version === 1 && saved.state && saved.records && saved.drafts && [0,1,2,3,4].includes(saved.state.step) && [9,10,11].every(day=>saved.records[day])) {
      state = saved.state; records = saved.records; drafts = saved.drafts;
    }
  } catch { /* This preview also works when local-file storage is unavailable. */ }
  function persistPreview() {
    try { sessionStorage.setItem(sessionKey, JSON.stringify({version:1,state,records,drafts})); } catch {}
  }
  function sizeLink() {
    return isFramed ? 'preview.html?design='+previewId+'&device='+previewDevice : 'index.html?device='+previewDevice+'#'+previewId;
  }
  const questionSet = [
    {text:'How strong was your heartburn today?',hint:'Choose the answer that feels closest.',type:'scale',low:'None',high:'Severe'},
    {text:'Did food or sour liquid come back into your throat or mouth today?',hint:'There is no right or wrong answer.',type:'yesno'},
    {text:'How much discomfort did you feel in your upper stomach today?',hint:'Think about the day as a whole.',type:'scale',low:'None',high:'Severe'},
    {text:'Did reflux disturb your sleep since your last check-in?',hint:'Choose the answer that feels closest.',type:'yesno'},
    {text:'How much did reflux affect your daily activities today?',hint:'This is the last question for today.',type:'scale',low:'Not at all',high:'Very much'}
  ];
  const paths = {
    arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
    expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5M8 8 3 3m13 5 5-5M8 16l-5 5m13-5 5 5"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18m-13 4h2m4 0h2m-8 3h2"/>',
    box:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 5v10l9 4 9-4V8M12 13v9M7.5 5.5l9 5"/>',
    home:'<path d="m3 11 9-8 9 8v10H3V11Zm6 10v-7h6v7"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    help:'<path d="M4 13v-2a8 8 0 0 1 16 0v2M4 12H2v7h4v-7H4Zm16 0h2v7h-4v-7h2Zm0 7c0 3-4 3-6 3"/>',
    leaf:'<path d="M20 3C7 2 1 10 6 17c8 5 15-2 14-14ZM4 21 16 9"/>',
    chart:'<path d="M4 4v16h16M7 14l4-4 4 3 5-7"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>'
  };
  function icon(name, cls='') {return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.leaf}</svg>`;}
  function cherries(fun=false) {return `<svg class="cherry-art ${fun?'with-faces':''}" viewBox="0 0 300 235" fill="none" aria-hidden="true">
    <ellipse cx="152" cy="215" rx="98" ry="10" fill="currentColor" opacity=".05"/>
    <path d="M95 133c10-56 64-56 75-110m38 116c4-48-32-83-38-116" stroke="var(--leaf,#546e48)" stroke-width="7" stroke-linecap="round"/>
    <path d="M171 25c32-27 67-11 70 7-30 17-58 11-70-7Z" fill="var(--leaf,#546e48)"/>
    <path d="M171 25c-30-20-43-9-45 3 17 11 31 8 45-3Z" fill="var(--leaf,#546e48)" opacity=".55"/>
    <path d="M143 154c0 35-24 56-52 56s-50-23-50-54 25-50 49-40c26-10 53 6 53 38Z" fill="var(--cherry,#a32949)"/>
    <path d="M253 162c0 35-24 55-51 55s-49-22-49-52 24-49 48-39c26-11 52 6 52 36Z" fill="var(--cherry-light,#c74962)"/>
    <path d="M61 148c2-8 8-13 14-14m96 18c2-8 8-12 14-14" stroke="#fff0db" stroke-width="7" stroke-linecap="round" opacity=".75"/>
    ${fun?'<path d="M76 165v4m30-4v4m84 5v4m28-4v4" stroke="#442a29" stroke-width="5" stroke-linecap="round"/><path d="M83 180q9 9 17 0m96 5q9 8 17 0" stroke="#442a29" stroke-width="3.5" stroke-linecap="round"/><ellipse cx="66" cy="179" rx="8" ry="4" fill="#ed8d8b"/><ellipse cx="116" cy="179" rx="8" ry="4" fill="#ed8d8b"/>':''}
  </svg>`;}
  function landscape(){return `<svg class="landscape" viewBox="0 0 470 220" fill="none" aria-hidden="true"><path d="M-30 174c104-87 194-76 287-17 89 56 159 51 259 1" stroke="currentColor"/><path d="M-30 190c104-87 194-76 287-17 89 56 159 51 259 1M-30 207c104-87 194-76 287-17 89 56 159 51 259 1" stroke="currentColor" opacity=".6"/><path d="M85 135V83m0 15c-57 1-44-67-7-61 36-41 88 28 31 57m179 78v-65m0 11c-43 0-40-58-7-54 34-29 72 27 29 53m99 47v-39m0 10c-32-1-31-46-5-43 25-22 52 20 20 40" stroke="currentColor" stroke-linecap="round"/><circle cx="385" cy="39" r="20" stroke="currentColor"/></svg>`;}
  function brand(){return `<button class="brand" data-action="home" aria-label="Cherry Together home"><img src="assets/cherry.svg" alt=""><span>cherry<span class="brand-second">together</span></span></button>`;}
  function profile(){return `<button class="profile" data-action="profile" aria-label="Open Alex's sample profile"><span class="avatar">A</span><span>Alex M.</span></button>`;}
  function nav(){return `<nav class="top-nav" aria-label="Main navigation"><button class="active" data-action="home">Today</button><button data-action="journey">Your study</button><button data-action="help">Help</button></nav>`;}
  function header(){return `<header class="app-header">${brand()}${nav()}${profile()}</header>`;}
  function button(label="Start today's check-in", extra=''){return `<button class="primary ${extra}" data-action="start">${label}${icon('arrow')}</button>`;}
  function stagePill(){return `<span class="pill">${icon('leaf')} Week 1 · Your starting week</span>`;}
  function stages(){return `<div class="stage-strip"><div class="current"><span>1</span><p>Your starting week<small>Record your symptoms</small></p></div><div><span>2</span><p>With cherry vinegar<small>Your next week</small></p></div><div><span>3</span><p>Your follow-up week<small>Keep checking in</small></p></div></div>`;}
  function calendar(compact=false){
    const days=['W','T','F','S','S','M','T'];
    const full=['Wednesday','Thursday','Friday','Saturday','Sunday','Monday','Tuesday'];
    return `<section class="calendar-card ${compact?'compact':''}"><div class="section-heading"><div><span class="eyebrow">ONE DAY AT A TIME</span><h2>Your first week</h2></div><span class="date-range">9–15 Sep</span></div><div class="calendar-grid">${days.map((d,i)=>{
      const n=i+9,done=i<3||(i===3&&state.completed),today=i===3;
      return `<button class="day ${done?'done':''} ${today?'today':''} ${i===5?'parcel-day':''}" data-day="${n}" aria-label="${full[i]}, September ${n}${done?', check-in complete':today?', today, check-in ready':i===5?', delivery expected':', upcoming'}"><span class="weekday">${d}</span><svg viewBox="0 0 54 68" aria-hidden="true"><rect class="tile-base" x="1.5" y="1.5" width="51" height="65" rx="12"/><path class="tile-rule" d="M2 21h50"/><path class="tile-binding" d="M17 0v7m20-7v7"/><text class="tile-number" x="27" y="42" text-anchor="middle">${n}</text>${done?'<path class="tile-check" d="m20 53 5 5 10-11"/>':i===5?'<path class="tile-package" d="m22 49 5-3 5 3v8l-5 2-5-2v-8Zm0 0 5 3 5-3m-5 3v7"/>':today?'<circle class="tile-dot" cx="27" cy="55" r="2.5"/>':''}</svg>${today?'<small>Today</small>':i===5?'<small>Delivery</small>':'<small>&nbsp;</small>'}</button>`;
    }).join('')}</div><div class="calendar-caption"><span>${icon('check')} ${state.completed?'4':'3'} check-ins so far</span><button class="text-button" data-action="journey">See all weeks ${icon('arrow')}</button></div></section>`;
  }
  function delivery(){return `<section class="delivery-box"><span class="box-icon">${icon('box')}</span><div><h3>Your vinegar is on its way</h3><p>Expected Monday, 14 September</p><button class="text-button" data-action="delivery">Delivery details ${icon('arrow')}</button></div></section>`;}
  function chart(){
 const entries=Object.entries(records).map(([date,answers])=>({date,value:answers[0]}));
 const points=entries.map((entry,i)=>({x:70+i*(270/Math.max(1,entries.length-1)),y:110-(entry.value-1)*15,...entry}));
 const line=points.map((p,i)=>(i?'L':'M')+p.x+' '+p.y).join(' ');
 return `<section class="chart-card"><div class="section-heading"><div><span class="eyebrow">A LITTLE PICTURE OF YOUR WEEK</span><h2>Your symptom notes</h2></div><button class="icon-button" data-action="chart" aria-label="Read symptom chart values">${icon('chart')}</button></div><p class="chart-caption">Heartburn · 1 = none, 7 = severe</p><svg class="symptom-chart" viewBox="0 0 420 145" role="img" aria-label="Sample heartburn ratings: ${entries.map(e=>'September '+e.date+', '+e.value+' of 7').join('; ')}. Days without answers are not plotted."><g class="chart-grid"><path d="M36 20h360M36 65h360M36 110h360"/></g><g class="chart-axis"><text x="12" y="24">7</text><text x="12" y="69">4</text><text x="12" y="114">1</text>${points.map(p=>`<text x="${p.x}" y="139" text-anchor="middle">${p.date} Sep</text>`).join('')}</g><path class="chart-line" d="${line}"/><g class="chart-points">${points.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="5"/>`).join('')}</g></svg><p class="chart-foot">Each dot is one of your check-ins.</p></section>`;
}
  function footer(){return `<footer class="app-footer"><span>Together with Red Truck Orchards</span><span>A small part of something good.</span></footer>`;}
  function support(){const label=isFramed?'Open full size':'Back to all designs';return `<div class="floating-tools"><a class="size-button" href="${sizeLink()}" target="_top" aria-label="${label}" title="${label}" data-label="${label}">${isFramed?icon('expand'):icon('arrow','back-icon')}</a><button class="support-button" data-action="help" aria-label="Open demo and help">${icon('help')}</button></div>`;}
  function todayCopy(){return state.completed?{title:'You are done for today.',text:'Thank you, Alex. See you tomorrow.',action:"Review today's answers"}:{title:"A small check-in.\nA useful part of your day.",text:'Five short questions about how you feel. About 2 minutes.',action:"Start today's check-in"};}
  function a1(){const c=todayCopy();return `${header()}<main class="journal-main"><div class="journal-intro"><div><span class="eyebrow">SATURDAY, 12 SEPTEMBER</span><h1>A little time<br>for <em>yourself.</em></h1></div><p>Good to see you, Alex. <br>Every check-in helps us learn.</p></div><div class="journal-columns"><section class="journal-today"><div class="journal-note-top"><span class="eyebrow">YOUR DAILY NOTE</span><span class="journal-day">Day <b>04</b></span></div><h2>${state.completed?'Thank you for<br>checking in.':'How has your<br>day been?'}</h2><p>${c.text}</p>${button(c.action)}<span class="time-note">${icon('clock')} Five questions. Your own pace.</span>${landscape()}</section><div class="journal-right"><div class="journal-stage">${stagePill()}<p>For now, record your symptoms.<br>Your vinegar week comes later.</p></div>${calendar(true)}${delivery()}</div></div><div class="journal-bottom"><blockquote>“Small steps,<br>taken together.”<span>THE CHERRY TOGETHER STUDY</span></blockquote>${chart()}</div></main>${footer()}${support()}`;}
  function a2(){return `<div class="studio-layout"><aside class="studio-sidebar">${brand()}<span class="eyebrow">YOUR SPACE</span><nav aria-label="Main navigation"><button class="active" data-action="home">${icon('home')} Today</button><button data-action="journey">${icon('calendar')} Your study</button><button data-action="chart">${icon('chart')} Symptom notes</button><button data-action="help">${icon('help')} Help</button></nav><div class="sidebar-bottom">${icon('leaf')}<p>One check-in at a time.<br>Thank you for taking part.</p>${profile()}</div></aside><div class="studio-content"><header class="studio-top"><div class="studio-mobile-brand">${brand()}</div><span class="breadcrumb">Your study <span>/</span> Today</span><span class="studio-date">${icon('calendar')} Saturday, 12 September</span></header><main><div class="studio-heading"><div><span class="eyebrow">REFLUX & HEARTBURN STUDY</span><h1>Hello, Alex.</h1><p>Here is your plan for today.</p></div><span class="pill neutral">${icon('leaf')} Stage 1 of 3</span></div><section class="studio-today"><div class="studio-day-number"><span>DAY</span><strong>04</strong><small>of your study</small></div><div class="studio-task"><span class="eyebrow">TODAY’S TASK</span><h2>${state.completed?'Your check-in is complete.':'Your daily check-in is ready.'}</h2><p>${state.completed?'Thank you. You can return tomorrow.':'Tell us how your symptoms have been today.'}</p><div class="studio-task-actions">${button(state.completed?"Review today's answers":'Begin check-in')}<span class="time-note">${icon('clock')} About 2 minutes</span></div></div><div class="studio-badge">${icon(state.completed?'check':'calendar')}</div></section>${stages()}<div class="studio-lower">${calendar()}${chart()}</div>${delivery()}</main>${footer()}</div></div>${support()}`;}
  function a3(){return `${header()}<main class="club-main"><section class="club-welcome"><div><span class="pill">${icon('sun')} A GOOD DAY TO CHECK IN</span><h1>Good to see<br>you, <span>Alex!</span></h1><p>Your small check-in helps us<br>learn something together.</p></div><div class="club-art">${cherries(true)}<span class="art-label">glad you’re here.</span><svg class="club-spark" viewBox="0 0 80 80" aria-hidden="true"><path d="m40 3 4 25 19-16-13 23 26 5-26 5 13 23-19-16-4 25-4-25-19 16 13-23-26-5 26-5-13-23 19 16Z" fill="currentColor"/></svg></div></section><div class="club-content"><section class="club-task"><div class="club-task-head"><span class="club-number">04</span><span>DAY FOUR<br><small>Your starting week</small></span></div><h2>${state.completed?'Look at you.<br>All done for today.':'Two minutes.<br>Your kind of pace.'}</h2><p>${state.completed?'Thank you for checking in. See you tomorrow.':'Five short questions. No perfect answers needed.'}</p>${button(state.completed?"Review today's answers":"Let’s check in")}<span class="club-task-foot">${icon('leaf')} Your vinegar week comes later.</span></section><div class="club-week">${calendar()}<div class="club-shipping">${delivery()}</div></div></div><div class="club-bottom"><div class="club-note"><span class="eyebrow">THREE WEEKS, TOGETHER</span><h2>Every day adds<br>a little to the picture.</h2><button class="text-button" data-action="journey">See what comes next ${icon('arrow')}</button></div>${chart()}</div></main>${footer()}${support()}`;}
  function flowMarkup(inline=false){
    const q=questionSet[state.step],values=q.type==='scale'?[1,2,3,4,5,6,7]:['Yes','No'];
    return `<div class="flow ${inline?'inline-flow':''}"><div class="flow-top"><span class="eyebrow">${state.editingDate&&state.editingDate!==12?'EDIT · '+state.editingDate+' SEPTEMBER':'TODAY · 12 SEPTEMBER'}</span><span>Question ${state.step+1} of 5</span></div><div class="flow-progress" aria-hidden="true">${questionSet.map((_,i)=>`<span class="${i<=state.step?'filled':''}"></span>`).join('')}</div><fieldset><legend tabindex="-1">${q.text}</legend><p class="flow-hint">${q.hint}</p><div class="answer-options ${q.type==='yesno'?'yes-no':''}">${values.map(value=>`<label class="answer-choice"><input type="radio" name="answer" value="${value}" ${String(state.answers[state.step])===String(value)?'checked':''}><span>${value}</span></label>`).join('')}</div>${q.type==='scale'?`<div class="scale-labels"><span>1 · ${q.low}</span><span>7 · ${q.high}</span></div>`:''}</fieldset><div class="flow-actions"><button class="text-button" data-action="flow-back">${state.step===0?(inline?'Your study':'Close'):'Back'}</button><button class="primary" data-action="flow-next" ${state.answers[state.step]===undefined?'disabled':''}>${state.step===4?'Finish check-in':'Next question'}${icon('arrow')}</button></div><p class="flow-bottom">Go at your own pace. You can change an answer.</p></div>`;
  }
  function a4(){return `${header()}<main class="focus-main"><div class="focus-kicker">${stagePill()}<button class="text-button" data-action="journey">Your progress ${icon('arrow')}</button></div><div class="focus-workspace"><aside class="focus-intro"><span class="eyebrow">A MOMENT FOR YOU</span><h1>One day. <br>One small <br><em>check-in.</em></h1><p>Good to see you, Alex. <br>Let’s take this one question at a time.</p><div class="focus-leaf">${icon('leaf')}</div></aside><section class="focus-question" id="inline-question">${state.completed?`<div class="focus-complete"><span class="success-icon">${icon('check')}</span><h2>You are done<br>for today.</h2><p>Thank you, Alex. See you tomorrow.</p>${button("Review today's answers")}</div>`:flowMarkup(true)}</section></div><div class="focus-bottom"><div class="focus-status"><span class="status-dot"></span><div><strong>Day 4 · Your starting week</strong><p>Your vinegar is expected on Monday, 14 September.</p></div></div><button class="text-button" data-action="delivery">Delivery details ${icon('arrow')}</button></div><details class="focus-details"><summary>See your calendar and symptom notes</summary><div class="focus-details-grid">${calendar()}${chart()}</div></details></main>${footer()}${support()}`;}
  function a5(){return `${header()}<main class="together-main"><div class="together-greeting"><div><span class="eyebrow">SATURDAY, 12 SEPTEMBER</span><h1>Hi, Alex. <span>A little check-in?</span></h1></div><span class="greeting-note">${icon('leaf')} We’re glad you’re here.</span></div><div class="together-layout"><div class="together-primary"><section class="together-task"><div class="task-meta">${stagePill()}<span>Day 4 of 7</span></div><div class="together-task-body"><div><h2>${state.completed?'All done.<br>And appreciated.':'A small moment.<br>A helpful habit.'}</h2><p>${state.completed?'Thank you for taking part today. Your next check-in is tomorrow.':'Tell us how you feel today.<br>Five short questions, at your own pace.'}</p></div><div class="together-art">${cherries()}</div></div><div class="together-cta">${button(state.completed?"Review today's answers":"Start today's check-in")}<span class="time-note">${icon('clock')} About 2 minutes</span></div><div class="task-footnote">${icon('leaf')} For now, record your symptoms. Your vinegar week comes later.</div></section>${calendar()}<div class="together-mobile-delivery">${delivery()}</div></div><aside class="together-secondary"><section class="journey-card"><div class="section-heading"><h2>Your three weeks</h2><button class="icon-button" data-action="journey" aria-label="Read about your three study stages">${icon('arrow')}</button></div><div class="journey-stops"><div class="current"><span class="stop">1</span><div><strong>Your starting week</strong><p>Record your symptoms.</p><small>YOU ARE HERE · 9–15 SEP</small></div></div><div><span class="stop">2</span><div><strong>With cherry vinegar</strong><p>A new step, when you are ready.</p></div></div><div><span class="stop">3</span><div><strong>Your follow-up week</strong><p>Keep your daily check-ins going.</p></div></div></div></section><div class="together-desktop-delivery">${delivery()}</div>${chart()}</aside></div><div class="together-thanks"><span class="mini-cherries">${cherries()}</span><p>Every check-in adds to the picture.<br><strong>Thank you for being part of the team.</strong></p></div></main>${footer()}${support()}`;}
  function render(){root.innerHTML=({a1,a2,a3,a4,a5}[design])();}
  function modal(content,label='Study details'){dialog.innerHTML=`<button class="modal-close icon-button" data-action="close" aria-label="Close">${icon('close')}</button>${content}`;dialog.setAttribute('aria-label',label);if(!dialog.open)dialog.showModal();}
  function openFlow(editDate=null){
    state.editingDate=editDate;
    state.step=0;
    state.answers = {...(drafts[editDate||12] || records[editDate||12] || {})};
    if(design==='a4'&&!editDate){if(dialog.open)dialog.close();state.completed=false;render();return;}
    modal(flowMarkup(),'Daily check-in');
  }
  function refreshFlow(){
    if(dialog.open)modal(flowMarkup(),'Daily check-in');
    else {const el=document.getElementById('inline-question');if(el)el.innerHTML=flowMarkup(true);}
    document.querySelector('.flow legend')?.focus();
  }
  function toast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3300);}
  function showJourney(){modal(`<span class="eyebrow">YOUR STUDY, AT A GLANCE</span><h2>Three weeks.<br>One day at a time.</h2><p>You can begin your first check-ins while your vinegar is on its way.</p><ol class="modal-stages"><li><strong>Your starting week</strong><span>9–15 September · Record your symptoms.</span></li><li><strong>With cherry vinegar</strong><span>16–22 September · We explain the next step before you begin.</span></li><li><strong>Your follow-up week</strong><span>23–29 September · Keep your daily check-ins going.</span></li></ol><p class="small-note">Later dates are estimates. If delivery is late, your next week starts later.</p><button class="primary" data-action="close">Got it ${icon('check')}</button>`,'Your three-week study');}
  function showDelivery(){modal(`<span class="modal-illustration">${icon('box')}</span><span class="eyebrow">ON ITS WAY TO YOU</span><h2>A little orchard<br>delivery.</h2><p>Your Cherry Vinegar is expected on <strong>Monday, 14 September.</strong></p><div class="soft-notice">Keep recording your symptoms while you wait. We will explain when to begin your vinegar week.</div><button class="primary" data-action="delivery-preview">See sample delivery message ${icon('mail')}</button>`,'Expected delivery');}
  function help(){modal(`<span class="eyebrow">A HELPING HAND</span><h2>Take a look around.</h2><p>This is a quick design preview. These actions let you try the layout.</p><div class="help-actions"><button data-action="start">${icon('calendar')} Try the daily check-in ${icon('arrow')}</button><button data-action="journey">${icon('leaf')} See the three weeks ${icon('arrow')}</button><button data-action="delivery-preview">${icon('mail')} Preview a delivery message ${icon('arrow')}</button><button data-action="reset">${icon('home')} Reset this preview ${icon('arrow')}</button></div><p class="small-note">Sample data only. This tab can remember your answers. Use Reset to start over.</p>`,'Demo and help');}
  document.addEventListener('change',event=>{
    if(event.target.matches('input[name="answer"]')){
      const value=event.target.value;
      state.answers[state.step]=questionSet[state.step].type==='scale'?Number(value):value;
      drafts[state.editingDate||12] = {...state.answers};
      persistPreview();
      const active=event.target.closest('.flow');active.querySelector('[data-action="flow-next"]').disabled=false;
    }
  });
  document.addEventListener('click',event=>{
    const day=event.target.closest('[data-day]');
    if(day){
      const n=Number(day.dataset.day);
      if(n===12)openFlow(state.completed?12:null);
      else if(n===14)showDelivery();
      else if(n<12)modal(`<span class="eyebrow">${n} SEPTEMBER · SAVED CHECK-IN</span><h2>A note from your week.</h2><p>You completed this sample check-in. You can review or change an answer.</p><div class="saved-answer"><span>Heartburn</span><strong>${records[n]?.[0]??'—'} <small>of 7</small></strong></div><button class="primary" data-action="edit" data-edit-date="${n}">Edit this response ${icon('arrow')}</button>`,'Saved check-in');
      else modal(`<span class="eyebrow">${n} SEPTEMBER</span><h2>One day at a time.</h2><p>This check-in is still ahead. For now, just focus on today.</p><button class="primary" data-action="close">Got it ${icon('check')}</button>`,'Upcoming check-in');
      return;
    }
    const actionEl=event.target.closest('[data-action]');if(!actionEl)return;
    const action=actionEl.dataset.action;
    if(action==='start'){openFlow(state.completed?12:null);}
    if(action==='edit'){openFlow(Number(actionEl.dataset.editDate));}
    if(action==='close'){dialog.close();}
    if(action==='home'){if(dialog.open)dialog.close();render();scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
    if(action==='journey')showJourney();
    if(action==='delivery')showDelivery();
    if(action==='help')help();
    if(action==='profile')modal(`<span class="eyebrow">YOUR SAMPLE PROFILE</span><h2>Alex Morgan</h2><p>Thank you for being part of Cherry Together.</p><dl class="profile-list"><dt>Study</dt><dd>Reflux and heartburn</dd><dt>Participant reference</dt><dd>K7M-P4X-9RT</dd><dt>Reminder</dt><dd>8:00 pm · Email</dd></dl><p class="small-note">Fictional profile for this visual preview.</p><button class="primary" data-action="close">Back to today ${icon('arrow')}</button>`,'Sample profile');
    if(action==='chart')modal(`<span class="eyebrow">YOUR SYMPTOM NOTES</span><h2>Each check-in<br>adds a little detail.</h2><p>Sample heartburn ratings. A higher number means stronger symptoms.</p><table class="data-table"><thead><tr><th>Date</th><th>Rating</th></tr></thead><tbody>${Object.entries(records).map(([date,answers])=>'<tr><td>'+date+' September</td><td>'+answers[0]+' of 7</td></tr>').join('')}</tbody></table><button class="primary" data-action="close">Got it ${icon('check')}</button>`,'Symptom chart values');
    if(action==='delivery-preview')modal(`<span class="eyebrow">DEMO MESSAGE · NO MESSAGE SENT</span><div class="message-preview"><span>${icon('mail')} Cherry Together</span><h2>Your delivery<br>is nearly here.</h2><p>Hi Alex. Your Cherry Vinegar is expected on Monday, 14 September. You can keep checking in while you wait.</p><small>Sample email · Today, 9:41 am</small></div><button class="primary" data-action="close">Back to my day ${icon('arrow')}</button>`,'Sample delivery message');
    if(action==='flow-back'){
      if(state.step>0){state.step--;refreshFlow();}
      else if(dialog.open)dialog.close();else showJourney();
    }
    if(action==='flow-next'&&state.answers[state.step]!==undefined){
      if(state.step<4){state.step++;refreshFlow();}
      else {
        const past=state.editingDate&&state.editingDate!==12;
        if(!past)state.completed=true;
        records[state.editingDate||12] = {...state.answers};
        delete drafts[state.editingDate||12];
        render();
        modal(`<div class="completion"><span class="success-icon">${icon('check')}</span>${cherries(design==='a3')}<span class="eyebrow">${past?'SAMPLE RESPONSE UPDATED':'THANK YOU FOR TAKING PART'}</span><h2>${past?'Your change is saved<br>in this preview.':'You are done!<br>See you tomorrow.'}</h2><p>${past?'You can return to your calendar now.':'One more check-in added to the picture.<br>Thank you, Alex.'}</p><button class="primary" data-action="close">Back to my day ${icon('arrow')}</button></div>`,'Check-in complete');
        state.editingDate=null;
      }
    }
    if(action==='reset')reset();
    persistPreview();
  });
  function reset(){records=structuredClone(initialRecords);drafts={};state={step:0,answers:{},completed:false,editingDate:null};if(dialog.open)dialog.close();render();persistPreview();toast('Preview reset. You are back on day 4.');}
  addEventListener('message',event=>{
    if(event.source!==parent)return;
    if(event.data?.type==='reset-preview')reset();
    if(event.data?.type==='preview-device'&&['desktop','mobile'].includes(event.data.device)){
      previewDevice=event.data.device;
      const link=document.querySelector('.size-button');if(link)link.href=sizeLink();
    }
  });
  addEventListener('pagehide',persistPreview);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persistPreview();});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  render();
})();
