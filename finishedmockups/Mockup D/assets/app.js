(function () {
  'use strict';
  const {getConcept,icon}=window.ORCHARD_D;
  const M=window.ORCHARD_MODEL;
  const params=new URLSearchParams(location.search);
  const concept=getConcept(params.get('design'));
  const store=M.createStore(concept.id);
  let state=store.state;
  const framed=parent!==window;
  let view={device:params.get('device')==='desktop'?'desktop':'mobile',filled:true};
  let calendarWeek=M.stage(state.today),chartMetric=0,guideStep=0,recordDay=null,edit=null,transitioning=false,dialogReturn=null;
  const root=document.getElementById('app'),dialog=document.getElementById('app-dialog'),announcer=document.getElementById('announcement');
  document.body.classList.add('design-'+concept.id);
  document.title=concept.id.toUpperCase()+' · Cherry On Together survey · Red Truck Orchards';
  root.innerHTML=`<div class="app-frame"><header class="app-header"><a class="brand" href="#" data-action="home" aria-label="Red Truck Orchards, Cherry On Together survey home"><img src="assets/orchard-mark.svg" alt=""><span><strong>Red Truck Orchards</strong><small>Cherry On Together survey</small></span></a><div class="account-tools"><button class="menu-button" data-action="menu" aria-label="Open menu">${icon('menu')}</button><button class="account-button" data-action="account" aria-label="Open account"><span class="avatar">A</span></button></div></header><main id="slide-area" tabindex="-1" aria-label="Current task"></main><nav class="dashboard" aria-label="Your survey"><button data-section="today">${icon('home')}<span>Today</span></button><button data-section="calendar">${icon('calendar')}<span>Calendar</span></button><button data-section="chart">${icon('chart')}<span>Chart</span></button><button data-section="guide">${icon('guide')}<span>Guide</span></button></nav><footer class="preview-tools"><button class="demo-chip" data-action="demo" aria-label="Open demo controls">DEMO<span class="demo-dot"></span></button><div class="view-tools"><button class="view-button" data-action="device" aria-label="Switch to desktop view" title="Switch to desktop view">${icon('desktop')}</button><button class="view-button" data-action="gallery" aria-label="Compare five mockups" title="Compare five mockups">${icon('cards')}</button><button class="view-button" data-action="frame" aria-label="Show review frame" title="Show review frame">${icon('frame')}</button><button class="view-button help-control" data-action="help" aria-label="Help" title="Help">${icon('help')}</button></div></footer></div>`;
  const stage=root.querySelector('#slide-area');
  const allSelected=()=>state.answers.every(value=>value!==null);
  const completeUse=()=>{const record=state.records[state.today];return M.stage(state.today)!==1||!!record&&(record.amount!==null&&(record.amount!=='none'||record.recall!==null));};
  const save=()=>store.save();
  function announce(text){announcer.textContent='';requestAnimationFrame(()=>{announcer.textContent=text;});}
  function esc(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
  function progress(label,extra=''){return `<div class="slide-progress"><span class="step-location"><span class="step-dot" aria-hidden="true"></span>${label}</span>${extra}</div>`;}
  function stageNote(){return `<span class="stage-note">${icon('leaf')}${M.stageName(state.today)}</span>`;}
  function button(label,action,cls='primary'){return `<button class="${cls}" type="button" data-action="${action}">${label}${cls==='primary'?`<span class="next-cue">${icon('arrow')}</span>`:''}</button>`;}
  function foot(primary,action,back='back',backLabel='Back'){return `<div class="slide-actions">${back?`<button class="back-button" data-action="${back}">${icon('back')}${backLabel}</button>`:'<span></span>'}${button(primary,action)}</div>`;}
  function scroll(content,cls=''){return `<div class="slide-scroll ${cls}">${content}</div>`;}
  function art(){return '<img class="cherry-friends" src="assets/cherry-friends.svg" alt="">';}
  function home(){
    if(state.coreSaved&&completeUse())return done();
    const started=state.answers.some(value=>value!==null)||state.coreSaved;
    const useDue=M.stage(state.today)===1;
    const extra=concept.level===1?`<div class="today-path"><span>${icon('guide')} Five questions</span>${useDue?`<span>${icon('leaf')} One short use check</span>`:''}</div><p class="home-hint">You can stop and come back to your place.</p>`:concept.level===2?'<p class="home-hint">One question at a time.</p>':'';
    return `${scroll(`<div class="today-intro"><div class="today-date">${M.date(state.today)}${stageNote()}</div><div class="home-art">${art()}</div><div class="today-copy"><span class="hello">Hello, Alex.</span><h1 tabindex="-1">Today!</h1><p class="today-message">${state.coreSaved?'Your five answers are saved.':started?'Your place is saved.':'A few answers about your day.'}</p><div class="today-plan"><span class="plan-leaf">${icon('leaf')}</span><div><strong>${state.coreSaved?'One short check is left.':started?'Continue from your last question.':useDue?'Five questions. One short check.':'Five short questions.'}</strong></div></div>${extra}</div></div>`,'home-scroll')}<div class="home-actions">${button("Let’s continue!",'start')}<p>${concept.level===4?'':started?'Continue when you are ready.':'Take the time you need.'}</p></div>`;
  }
  function options(items,selected,name='answer'){
    return `<div class="answer-list">${items.map(item=>`<label class="answer-row ${item.value===selected?'selected':''}"><input type="radio" name="${name}" value="${item.value}" ${item.value===selected?'checked':''}><span class="choice-box">${icon('check')}</span>${item.number?`<span class="answer-number">${item.number}</span>`:''}<span class="answer-label">${item.label}</span></label>`).join('')}</div>`;
  }
  function questionItems(index){const yesno=[1,3].includes(index);return [...(yesno?[{value:'No',label:'No'},{value:'Yes',label:'Yes'}]:[1,2,3,4,5,6,7].map(value=>({value,number:value,label:(index===4?M.ACTIVITY_SCALE:M.SCALE)[value-1]}))),{value:'unknown',label:'I do not know'}];}
  function selectionText(value,index){if(value===null)return 'Choose one answer.';if(index!==undefined)return 'Selected: '+M.label(index,value);return 'Selected: '+(M.AMOUNTS.find(x=>x.value===value)||M.RECALL.find(x=>x.value===value))?.label;}
  function question(){
    const i=edit?edit.index:state.step,selected=edit?edit.value:state.answers[i];
    const full=concept.level===1,compact=concept.level>=3;
    const context=!edit&&[1,2].includes(concept.level)?`<div class="question-context">${stageNote()}<span>${M.date(state.today,true)}</span></div>`:'';
    const hint=full?M.EXPLANATIONS[i]:concept.level===2?'Choose the answer that fits today.':concept.level===5&&i===0?'Choose one answer.':'';
    const status=full||concept.level===2?selectionText(selected,i):selected===null?'':concept.level===4?'':'Answer selected.';
    return `${progress(edit?`Change answer · ${M.date(edit.day,true)}`:`Question ${i+1} of 5`,edit?'':`<button class="pause-link" data-action="pause">Pause</button>`)}<form id="answer-form" class="answer-form">${scroll(`${context}<fieldset><legend tabindex="-1">${forDay(M.QUESTIONS[i])}</legend>${hint?`<p class="question-hint">${forDay(hint)}</p>`:''}${options(questionItems(i),selected)}</fieldset><p class="inline-error" id="answer-error" hidden>Choose an answer, or choose “I do not know.”</p>`,'question-scroll'+(compact?' compact':''))}<div class="answer-footer"><p class="selection-status" id="selection-status" ${concept.level===4?'aria-hidden="true"':''}>${status}</p><div class="slide-actions"><button type="button" class="back-button" data-action="${edit?'cancel-edit':'back'}">${icon('back')}Back</button><button class="primary next-button ${selected!==null?'ready':''}" id="next-button" type="submit" ${selected===null?'disabled':''}>${edit?'Save change':'Next'}<span class="next-cue">${icon('arrow')}</span></button></div></div></form>`;
  }
  function forDay(text){return edit&&edit.day!==state.today?text.replaceAll('today','that day').replace('since your last survey','before that day’s survey'):text;}
  function amount(){
    return `${progress('One short check')}<form id="amount-form" class="answer-form">${scroll(`<span class="saved-note">${icon('check')} Your five answers are saved.</span><fieldset><legend tabindex="-1">How much cherry vinegar did you take today?</legend><p class="question-hint">Choose one answer.</p>${options(M.AMOUNTS,state.amount,'amount')}</fieldset>`,'check-scroll')}<div class="answer-footer"><p class="selection-status" id="selection-status">${state.amount===null?'':concept.level===4?'':'Answer selected.'}</p><div class="slide-actions"><button type="button" class="back-button" data-action="amount-back">${icon('back')}Back</button><button class="primary next-button ${state.amount!==null?'ready':''}" id="next-button" type="submit" ${state.amount===null?'disabled':''}>Next<span class="next-cue">${icon('arrow')}</span></button></div></div></form>`;
  }
  function recall(){
    return `${progress('One more detail · Optional','<button class="pause-link" data-action="skip-recall">Skip</button>')}<form id="recall-form" class="answer-form">${scroll(`<span class="saved-note">${icon('check')} Your answers are saved.</span><fieldset><legend tabindex="-1">When did you last take some?</legend><p class="question-hint">No need to guess.</p>${options(M.RECALL,state.recall,'recall')}</fieldset>`,'check-scroll')}<div class="answer-footer"><p class="selection-status" id="selection-status">${state.recall===null?'':concept.level===4?'':'Answer selected.'}</p><div class="slide-actions"><button type="button" class="back-button" data-action="recall-back">${icon('back')}Back</button><button class="primary next-button ${state.recall!==null?'ready':''}" id="next-button" type="submit" ${state.recall===null?'disabled':''}>Finish<span class="next-cue">${icon('check')}</span></button></div></div></form>`;
  }
  function done(){
    return `${scroll(`<div class="done-panel"><div class="done-check">${icon('check')}</div><span class="eyebrow">${M.date(state.today)}</span><h1 tabindex="-1">Done for today.</h1><p>Thank you for your answers.</p><div class="saved-receipt">${icon('calendar')}<div><strong>Five answers saved</strong><small>${store.persistent?'Saved in this demo.':'Kept until this page is closed.'}</small></div>${icon('check')}</div><p class="next-day">${state.scenario==='complete'?'Your three weeks are complete.':'Come back tomorrow.'}</p><button class="text-link" data-action="today-record">View or change today’s answers</button><div class="done-cherries">${art()}</div></div>`)}${foot('View my week','calendar',null)}`;
  }
  function calendar(){
    if(recordDay!==null)return recordScreen();
    const first=calendarWeek*7+1;
    const weekName=['Starting week','Vinegar week','Follow-up week'][calendarWeek];
    return `${scroll(`<div class="page-heading"><span class="eyebrow">YOUR STUDY</span><h1 tabindex="-1">Your calendar.</h1><p>Choose a day to see your answers.</p></div><div class="week-picker"><button data-action="previous-week" aria-label="Previous week" ${calendarWeek===0?'disabled':''}>${icon('back')}</button><div><strong>${weekName}</strong><small>${M.date(first,true)}–${M.date(first+6,true)}</small></div><button data-action="next-week" aria-label="Next week" ${calendarWeek===2?'disabled':''}>${icon('arrow')}</button></div><div class="calendar-days">${Array.from({length:7},(_,i)=>{
      const day=first+i,record=state.records[day],future=day>state.today;
      const status=record?'Answers saved':future?'Not yet':day===state.today?'Ready today':'No answers';
      const use=record&&calendarWeek===1?(record.amount===null?'Use check is open':M.amountLabel(record.amount)):'';
      return `<button class="day-row ${day===state.today?'is-today':''}" data-action="day" data-day="${day}"><span class="day-tile"><small>${new Date(2026,8,day+8).toLocaleDateString('en-US',{weekday:'short'})}</small><b>${day+8}</b></span><span class="day-copy"><strong>${day===state.today?'Today':status}</strong><small>${day===state.today?status:use||`Study day ${day}`}</small>${day===state.today&&use?`<small>${use}</small>`:''}</span>${icon(record?'check':future?'clock':'chevron')}</button>`;
    }).join('')}</div>`,'support-scroll')}${foot(state.flow==='home'||state.flow==='done'?'Back to today':'Back to my question','today',null)}`;
  }
  function recordScreen(){
    const record=state.records[recordDay];
    if(!record)return `${scroll(`<div class="page-heading"><span class="eyebrow">${M.date(recordDay)}</span><h1 tabindex="-1">${recordDay>state.today?'This day is ahead.':'No answers for this day.'}</h1><p>${recordDay===state.today?'You can answer today’s questions now.':recordDay>state.today?'Your answers will appear here after your survey.':'This day stays blank on your chart.'}</p></div>`)}${foot(recordDay===state.today?'Continue today':'Back to calendar',recordDay===state.today?'today':'close-record',null)}`;
    return `${scroll(`<div class="page-heading"><span class="eyebrow">${M.date(recordDay)}</span><h1 tabindex="-1">Your answers.</h1><p>Choose an answer to change it.</p></div><div class="record-list">${record.answers.map((value,index)=>`<button data-action="edit-answer" data-index="${index}" class="record-row"><span><small>${M.TOPICS[index]}</small><strong>${M.label(index,value)}</strong></span>${icon('chevron')}</button>`).join('')}${M.stage(recordDay)===1?`<button data-action="edit-amount" class="record-row"><span><small>Cherry vinegar</small><strong>${M.amountLabel(record.amount)}</strong></span>${icon('chevron')}</button>`:''}</div>${record.recall&&record.recall!=='skipped'?`<p class="record-note">Last use reported: ${M.RECALL.find(x=>x.value===record.recall)?.label||'Not known'}.</p>`:''}`,'support-scroll')}${foot('Back to calendar','close-record',null)}`;
  }
  function editAmount(){
    return `${progress(`Change use · ${M.date(edit.day,true)}`)}<form class="answer-form" id="edit-amount-form">${scroll(`<fieldset><legend tabindex="-1">How much did you take that day?</legend><p class="question-hint">Choose one answer.</p>${options(M.AMOUNTS,edit.value,'edit-amount')}</fieldset>`,'check-scroll')}<div class="answer-footer"><p class="selection-status" id="selection-status"></p><div class="slide-actions"><button class="back-button" type="button" data-action="cancel-edit">${icon('back')}Back</button><button class="primary next-button ${edit.value!==null?'ready':''}" id="next-button" type="submit" ${edit.value===null?'disabled':''}>Save change<span class="next-cue">${icon('check')}</span></button></div></div></form>`;
  }
  function graph(){
    const yesno=[1,3].includes(chartMetric),x=day=>36+(day-1)*14,y=value=>yesno?(value==='Yes'?45:173):173-(value-1)*21.3;
    let previous=null,lines='',points='';
    for(let day=1;day<=21;day++){
      const record=state.records[day],value=record?.answers[chartMetric];
      if(value===undefined||value===null||value==='unknown'){previous=null;continue;}
      const here={x:x(day),y:y(value)};
      if(previous)lines+=`<path d="M${previous.x} ${previous.y} L${here.x} ${here.y}"/>`;
      points+=`<circle cx="${here.x}" cy="${here.y}" r="3.2"/>`;previous=here;
    }
    const ticks=yesno?[['Yes',45],['No',173]]:[['7',45],['4',109],['1',173]];
    return `<svg class="answer-chart" viewBox="0 0 350 230" role="img" aria-labelledby="chart-title chart-description"><title id="chart-title">${M.TOPICS[chartMetric]} across the three weeks</title><desc id="chart-description">${yesno?'No and Yes answers':'Ratings from 1 to 7'}. Dates run from September 9 to 29. Gaps mean no recorded answer. The values are available in the table below.</desc><rect x="29" y="22" width="98" height="164" rx="5" fill="#eee9de"/><rect x="127" y="22" width="98" height="164" rx="5" fill="#e1e9d9"/><rect x="225" y="22" width="98" height="164" rx="5" fill="#eee6dd"/>${ticks.map(([label,y])=>`<path d="M29 ${y}H323" stroke="#cfc8b7" stroke-dasharray="3 4"/><text x="20" y="${y+4}" text-anchor="end" class="chart-label">${label}</text>`).join('')}<g class="chart-lines">${lines}</g><g class="chart-points">${points}</g>${[1,7,14,21].map(day=>`<text x="${x(day)}" y="207" text-anchor="middle" class="chart-label">${day+8}</text>`).join('')}<text x="176" y="227" text-anchor="middle" class="chart-label">September</text></svg>`;
  }
  function chart(){
    return `${scroll(`<div class="page-heading"><span class="eyebrow">YOUR ANSWERS OVER TIME</span><h1 tabindex="-1">Your chart.</h1><p>See how your answers change.</p></div><label class="chart-select-label" for="chart-question">Show answers for</label><select id="chart-question">${M.TOPICS.map((topic,i)=>`<option value="${i}" ${i===chartMetric?'selected':''}>${topic}</option>`).join('')}</select><div class="chart-card"><div class="stage-legend"><span>Before</span><span>Vinegar week</span><span>After</span></div>${graph()}<p class="chart-scale">${[1,3].includes(chartMetric)?'Each point is your Yes or No answer.':`1 = ${chartMetric===4?'Not at all':'None'} · 7 = ${chartMetric===4?'Very much':'Severe'}`}</p></div><div class="stage-brief">${icon('leaf')}<div><strong>${M.stageName(state.today)}</strong><p>${M.stage(state.today)===0?'Next: your vinegar week.':M.stage(state.today)===1?'Next: your follow-up week.':'This is the last study week.'}</p></div></div><details class="chart-data"><summary>See daily answers and use</summary><p>Blank days have no answer. Use is recorded separately from each week.</p><table><caption>${M.TOPICS[chartMetric]} · September</caption><thead><tr><th scope="col">Day</th><th scope="col">Answer</th><th scope="col">Use</th></tr></thead><tbody>${Array.from({length:state.today},(_,i)=>{const day=i+1,r=state.records[day];return `<tr><th scope="row">${day+8}</th><td>${r?M.label(chartMetric,r.answers[chartMetric]):'No answer'}</td><td>${r?M.amountLabel(r.amount):'Not recorded'}</td></tr>`;}).join('')}</tbody></table></details><p class="sample-note">Sample answers. The chart shows change, not its cause.</p>`,'support-scroll')}${foot('Back to today','today',null)}`;
  }
  const guidePages=[
    {title:'Who is this for?',text:'Red Truck Orchards runs this survey. Volunteers share their daily answers.',icon:'user'},
    {title:'What do I do?',text:'Answer five questions about today. In your vinegar week, add one short use check.',icon:'guide'},
    {title:'When do I answer?',text:'Visit once each day. You can stop and come back to your place.',icon:'clock'},
    {title:'Where are my details?',text:'Calendar shows your days. Chart shows your answers across the three weeks.',icon:'calendar'},
    {title:'Why do my answers help?',text:'They show the team how you felt over time. Choose what fits, even if your answers do not change.',icon:'leaf'}
  ];
  function guide(){const page=guidePages[guideStep];return `${progress(`Your guide · ${guideStep+1} of 5`)}${scroll(`<div class="guide-page"><span class="guide-icon">${icon(page.icon)}</span><h1 tabindex="-1">${page.title}</h1><p>${page.text}</p>${guideStep===2?'<div class="three-weeks"><span><b>1</b> Before vinegar</span><span><b>2</b> Vinegar week</span><span><b>3</b> After vinegar</span></div>':''}${guideStep===4?'<p class="guide-small">Follow the study team’s directions. Use Help if you have a question.</p>':''}</div>`)}${foot(guideStep===4?'Back to today':'Next',guideStep===4?'today':'guide-next',guideStep===0?'today':'guide-back')}`;}
  function signedOut(){return `${scroll(`<div class="sign-in-page"><div class="home-art">${art()}</div><span class="eyebrow">RED TRUCK ORCHARDS</span><h1 tabindex="-1">Cherry On<br>Together.</h1><p>Sign in to continue your survey.</p><small>This preview uses a sample account.</small></div>`)}${foot('Sign in as Alex','sign-in',null)}`;}
  function content(){if(!state.signedIn)return signedOut();if(edit)return edit.kind==='amount'?editAmount():question();if(state.section==='calendar')return calendar();if(state.section==='chart')return chart();if(state.section==='guide')return guide();return state.flow==='question'?question():state.flow==='amount'?amount():state.flow==='recall'?recall():state.flow==='done'?done():home();}
  function render(direction=0){
    const old=stage.firstElementChild;
    const canAnimate=!!direction&&!!old&&!matchMedia('(prefers-reduced-motion:reduce)').matches;
    const panel=document.createElement('div');panel.className='slide';panel.innerHTML=content();
    if(old&&canAnimate){old.inert=true;old.setAttribute('aria-hidden','true');old.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));old.classList.add('outgoing');old.animate([{transform:'translateX(0)',opacity:1},{transform:`translateX(${direction>0?'-':'+'}12%)`,opacity:0}],{duration:210,easing:'ease-out'}).finished.then(()=>old.remove()).catch(()=>old.remove());}
    else if(old)old.remove();
    stage.append(panel);
    root.querySelectorAll('[data-section]').forEach(button=>button.setAttribute('aria-current',button.dataset.section===state.section?'page':'false'));
    root.querySelector('.avatar').innerHTML=state.signedIn?'A':icon('user');
    root.querySelector('.account-button').setAttribute('aria-label',state.signedIn?'Open Alex’s account':'Sign in');
    if(canAnimate){transitioning=true;panel.animate([{transform:`translateX(${direction>0?'':'-'}14%)`,opacity:.25},{transform:'translateX(0)',opacity:1}],{duration:300,easing:'cubic-bezier(.2,.7,.3,1)'}).finished.then(()=>{transitioning=false;focusSlide(panel);}).catch(()=>{transitioning=false;});}
    else{transitioning=false;if(direction)focusSlide(panel);}
    applyView();
  }
  function focusSlide(panel){if(panel.isConnected&&!panel.inert)(panel.querySelector('legend,h1')||stage).focus({preventScroll:true});}
  function go(flow,direction=1){state.flow=flow;state.section='today';save();render(direction);}
  function navigate(section){recordDay=null;edit=null;state.section=section;if(section==='calendar')calendarWeek=M.stage(state.today);save();render(1);}
  function applyView(){document.body.dataset.device=view.device;document.body.classList.toggle('standalone',!framed);const device=root.querySelector('[data-action="device"]'),next=view.device==='mobile'?'desktop':'mobile';device.innerHTML=icon(next);device.setAttribute('aria-label','Switch to '+next+' view');device.title='Switch to '+next+' view';const frame=root.querySelector('[data-action="frame"]');frame.innerHTML=icon(view.filled?'frame':'expand');frame.setAttribute('aria-label',view.filled?'Show review frame':'Fill the app frame');frame.title=view.filled?'Show review frame':'Fill the app frame';}
  function openDialog(title,body,kind='help'){
    if(!dialog.open)dialogReturn=document.activeElement;
    dialog.dataset.kind=kind;dialog.innerHTML=`<div class="dialog-heading"><h2 id="dialog-title" tabindex="-1">${title}</h2><button data-action="close-dialog" aria-label="Close">${icon('close')}</button></div><div class="dialog-body">${body}</div>`;
    if(!dialog.open)dialog.showModal();dialog.scrollTop=0;document.getElementById('dialog-title').focus({preventScroll:true});
  }
  function closeDialog(){dialog.close();}
  function menuRow(label,action,extra=''){return `<button class="flyout-row" data-action="${action}" ${extra}><span>${label}</span>${icon('chevron')}</button>`;}
  function help(){openDialog('Need help?',`<p>${state.flow==='question'&&state.section==='today'?'Choose one answer. Then press Next.':'Use Today to open your daily survey.'}</p>${state.flow==='question'&&state.section==='today'?menuRow('Explain this question','explain'):menuRow('Read the short guide','open-guide')}${menuRow('Ask Red Truck Orchards','contact')}`,'help');}
  function menu(){openDialog('Menu',`${menuRow('Today','menu-today')}${menuRow('Your study guide','open-guide')}${menuRow('Your delivery','delivery')}`,'menu');}
  function account(){openDialog(state.signedIn?'Hello, Alex.':'Your account',state.signedIn?`<p>Alex Morgan<br><span class="small-note">Sample volunteer</span></p>${menuRow('Sign out','sign-out')}`:`<p>This preview uses a sample account.</p>${button('Sign in as Alex','sign-in')}`,'account');}
  function demo(){openDialog('Demo controls',`<p class="demo-caption">${concept.id.toUpperCase()} · ${concept.name}</p>${menuRow('Load a study week','demo-weeks')}${menuRow('Change the sample chart','demo-patterns')}${menuRow('Developer notes','notes')}${menuRow('Reset this design','reset-confirm')}`,'demo');}
  function demoWeeks(){openDialog('Choose a sample',`<p class="small-note">This replaces sample changes in ${concept.id.toUpperCase()}.</p>${Object.entries(M.SCENARIOS).map(([id,item])=>menuRow(item.label,'load-sample',`data-scenario="${id}"`)).join('')}${menuRow('Back','demo')}`,'demo');}
  function demoPatterns(){openDialog('Sample chart',`<p class="small-note">This loads new sample answers. Each pattern is fictional.</p>${menuRow('Mixed responses','load-pattern','data-pattern="mixed"')}${menuRow('Lower ratings','load-pattern','data-pattern="lower"')}${menuRow('Higher ratings','load-pattern','data-pattern="higher"')}${menuRow('Back','demo')}`,'demo');}
  function reset(scenario='vinegar',pattern='mixed'){store.reset(scenario,pattern);state=store.state;calendarWeek=M.stage(state.today);recordDay=null;edit=null;closeDialog();render(1);announce('Sample loaded.');}
  function editAnswer(index){const record=state.records[recordDay];if(!record)return;edit={kind:'answer',day:recordDay,index,value:record.answers[index]};render(1);}
  function finish(){state.flow='done';state.section='today';save();render(1);announce('Done for today. Your answers are saved.');}
  function nextQuestion(){
    if(transitioning)return;
    if(edit){if(edit.value===null)return;const record=state.records[edit.day],answers=[...record.answers];answers[edit.index]=edit.value;store.edit(edit.day,answers,record.amount);recordDay=edit.day;edit=null;save();render(-1);announce('Change saved.');return;}
    if(state.answers[state.step]===null){document.getElementById('answer-error').hidden=false;announce('Choose one answer.');return;}
    if(state.step<4){state.step++;go('question');}
    else if(store.commitAnswers()){if(M.stage(state.today)===1)go('amount');else finish();}
  }
  document.addEventListener('submit',event=>{
    if(!['answer-form','amount-form','recall-form','edit-amount-form'].includes(event.target.id))return;
    event.preventDefault();if(transitioning)return;
    if(event.target.id==='answer-form')nextQuestion();
    if(event.target.id==='amount-form'&&state.amount!==null){store.commitUse();if(state.amount==='none')go('recall');else finish();}
    if(event.target.id==='recall-form'&&state.recall!==null){store.commitUse();finish();}
    if(event.target.id==='edit-amount-form'&&edit?.value!==null){const record=state.records[edit.day];store.edit(edit.day,record.answers,edit.value);recordDay=edit.day;edit=null;render(-1);announce('Change saved.');}
  });
  document.addEventListener('change',event=>{
    const input=event.target;
    if(input.id==='chart-question'){chartMetric=Number(input.value);render();stage.querySelector('#chart-question').focus({preventScroll:true});return;}
    if(!input.matches('input[type="radio"]'))return;
    const value=/^[1-7]$/.test(input.value)?Number(input.value):input.value;
    if(input.name==='answer'){const i=edit?edit.index:state.step;if(!M.validAnswer(value,i))return;if(edit)edit.value=value;else state.answers[i]=value;}
    if(input.name==='amount'){state.amount=value;state.recall=null;}
    if(input.name==='recall')state.recall=value;
    if(input.name==='edit-amount')edit.value=value;
    save();
    const panel=input.closest('.slide');panel.querySelectorAll('.answer-row').forEach(row=>row.classList.toggle('selected',row.querySelector('input').checked));
    const next=panel.querySelector('#next-button');next.disabled=false;next.classList.remove('ready');void next.offsetWidth;next.classList.add('ready');
    const status=panel.querySelector('#selection-status');if(status)status.textContent=concept.level===4?'':concept.level<=2&&input.name==='answer'?selectionText(value,edit?edit.index:state.step):'Answer selected.';
    announce('Selected: '+input.closest('.answer-row').innerText.trim().replace(/\s+/g,' '));
  });
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-action],[data-section]');if(!button)return;event.preventDefault();
    if(transitioning&&!['close-dialog','help','demo','menu','account'].includes(button.dataset.action))return;
    if(button.dataset.section){navigate(button.dataset.section);return;}
    const action=button.dataset.action;
    switch(action){
      case 'home':recordDay=null;edit=null;state.section='today';go('home',-1);break;
      case 'start':if(state.coreSaved&&!completeUse()){go(state.records[state.today]?.amount==='none'?'recall':'amount');}else if(state.coreSaved)go('done');else go('question');break;
      case 'back':if(state.step>0){state.step--;go('question',-1);}else go('home',-1);break;
      case 'pause':go('home',-1);announce('Your place is saved.');break;
      case 'amount-back':state.step=4;go('question',-1);break;
      case 'recall-back':go('amount',-1);break;
      case 'skip-recall':state.recall='skipped';store.commitUse();finish();break;
      case 'today':navigate('today');break;
      case 'calendar':navigate('calendar');break;
      case 'previous-week':calendarWeek=Math.max(0,calendarWeek-1);render(-1);break;
      case 'next-week':calendarWeek=Math.min(2,calendarWeek+1);render(1);break;
      case 'day':recordDay=Number(button.dataset.day);render(1);break;
      case 'close-record':recordDay=null;render(-1);break;
      case 'today-record':state.section='calendar';recordDay=state.today;save();render(1);break;
      case 'edit-answer':editAnswer(Number(button.dataset.index));break;
      case 'cancel-edit':edit=null;render(-1);break;
      case 'edit-amount':edit={kind:'amount',day:recordDay,value:state.records[recordDay].amount};render(1);break;
      case 'guide-next':guideStep=Math.min(4,guideStep+1);render(1);break;
      case 'guide-back':guideStep=Math.max(0,guideStep-1);render(-1);break;
      case 'menu':menu();break;
      case 'menu-today':closeDialog();navigate('today');break;
      case 'open-guide':closeDialog();guideStep=0;navigate('guide');break;
      case 'account':account();break;
      case 'sign-out':state.signedIn=false;save();closeDialog();render(1);break;
      case 'sign-in':state.signedIn=true;save();if(dialog.open)closeDialog();render(1);break;
      case 'help':help();break;
      case 'explain':openDialog('About this question',`<p>${forDay(M.EXPLANATIONS[edit?edit.index:state.step])}</p>${button('Back to my question','close-dialog')}`,'help');break;
      case 'contact':openDialog('Ask the orchard',`<p>Tell the study team what you need help with.</p><p class="sample-notice">This preview does not send messages.</p>${button('See a sample message','sample-message')}`,'help');break;
      case 'sample-message':openDialog('Sample message','<p>To: Red Truck Orchards</p><div class="message-card">Hello. I need help with my survey.<br>Alex Morgan</div><p class="small-note">Sample only. No message was sent.</p>'+button('Close','close-dialog'),'help');break;
      case 'delivery':openDialog('Your delivery',state.scenario==='baseline'?'<p>Your vinegar is on its way.</p><p>Expected September 14. You can answer your daily questions while you wait.</p>'+button('Close','close-dialog'):'<p>Your vinegar was received on September 14.</p>'+button('Ask about my delivery','contact'),'menu');break;
      case 'demo':demo();break;
      case 'demo-weeks':demoWeeks();break;
      case 'demo-patterns':demoPatterns();break;
      case 'load-sample':reset(button.dataset.scenario,state.pattern);break;
      case 'load-pattern':reset(state.scenario,button.dataset.pattern);break;
      case 'reset-confirm':openDialog('Reset this design?',`<p>This clears sample changes in ${concept.id.toUpperCase()}.</p>${button('Reset sample','reset')}${menuRow('Keep my place','close-dialog')}`,'demo');break;
      case 'reset':reset();break;
      case 'notes':if(framed){closeDialog();parent.postMessage({type:'d-notes'},'*');}else openDialog('Developer notes',window.ORCHARD_D.notes(concept),'notes');break;
      case 'device':if(framed)parent.postMessage({type:'d-device'},'*');else{view.device=view.device==='mobile'?'desktop':'mobile';applyView();}break;
      case 'frame':if(framed)parent.postMessage({type:'d-frame'},'*');else location.href=`index.html?design=${concept.id}&device=${view.device}&view=review`;break;
      case 'gallery':if(framed)parent.postMessage({type:'d-gallery'},'*');else location.href=`index.html?design=${concept.id}#mockups`;break;
      case 'close-dialog':closeDialog();break;
    }
  });
  dialog.addEventListener('close',()=>{if(dialogReturn?.isConnected)dialogReturn.focus({preventScroll:true});else focusSlide(stage.lastElementChild);});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog();}});
  addEventListener('message',event=>{if(!framed||event.source!==parent||(location.protocol!=='file:'&&event.origin!==location.origin))return;if(event.data?.type==='d-view'){view={device:event.data.device==='desktop'?'desktop':'mobile',filled:!!event.data.filled};applyView();}});
  render();if(framed)parent.postMessage({type:'d-ready'},'*');
})();
