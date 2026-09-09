(function () {
  'use strict';
  const TOPICS = ['Heartburn', 'Food or liquid coming back up', 'Upper-stomach discomfort', 'Sleep', 'Daily tasks'];
  const QUESTIONS = [
    'How strong was your heartburn today?',
    'Did food or sour liquid come back into your throat or mouth today?',
    'How much discomfort did you have in your upper stomach today?',
    'Did reflux disturb your sleep since your last survey?',
    'How much did reflux affect your daily tasks today?'
  ];
  const EXPLANATIONS = [
    'Choose how strong the heartburn felt. Think about today.',
    'Choose Yes if food or sour liquid came back up today. Choose No if it did not.',
    'Think about discomfort in the upper part of your stomach today.',
    'Reflux is when food or liquid comes back up. Think about your sleep since your last survey.',
    'Think about your usual tasks today. Choose how much reflux affected them.'
  ];
  const SCALE = ['None', 'Very mild', 'Mild', 'Moderate', 'Strong', 'Very strong', 'Severe'];
  const ACTIVITY_SCALE = ['Not at all', 'Very little', 'A little', 'Moderately', 'Quite a lot', 'A lot', 'Very much'];
  const AMOUNTS = [{value:'full',label:'I took 1 tablespoon'},{value:'less',label:'I took less than 1 tablespoon'},{value:'more',label:'I took more than 1 tablespoon'},{value:'none',label:'I did not take any today'},{value:'unknown',label:'I do not know'}];
  const RECALL = [{value:'yesterday',label:'Yesterday'},{value:'two-three',label:'2 or 3 days ago'},{value:'four-plus',label:'4 or more days ago'},{value:'never',label:'I have not taken any'},{value:'unknown',label:'I do not remember'}];
  const SCENARIOS = {baseline:{day:4,label:'Starting week'},vinegar:{day:11,label:'Vinegar week'},followup:{day:18,label:'Follow-up week'},complete:{day:21,label:'Study complete'}};
  const PATTERNS = {mixed:[4,5,4,6,4,null,5,5,4,5,3,4,3,4,4,3,4,5,4,3,4],lower:[5,4,6,5,5,null,4,4,4,3,3,2,3,2,3,4,3,4,3,4,3],higher:[3,2,3,3,2,null,3,3,4,4,5,4,5,4,4,4,3,4,3,3,4]};
  function stage(day) {return day<=7?0:day<=14?1:2;}
  function stageName(day) {return ['Starting week','Vinegar week','Follow-up week'][stage(day)];}
  function date(day, short=false) {return new Date(2026,8,day+8).toLocaleDateString('en-US',short?{month:'short',day:'numeric'}:{weekday:'short',month:'short',day:'numeric'});}
  function label(index,value) {if(value===null)return 'No answer';if(value==='unknown')return 'I do not know';if([1,3].includes(index))return value;return `${value} · ${(index===4?ACTIVITY_SCALE:SCALE)[value-1]}`;}
  function amountLabel(value) {return value==='not_due'?'No use check planned':AMOUNTS.find(item=>item.value===value)?.label||'Use not recorded';}
  function validAnswer(value,index) {return value===null||value==='unknown'||([1,3].includes(index)?['Yes','No'].includes(value):Number.isInteger(value)&&value>=1&&value<=7);}
  function validAnswers(list) {return Array.isArray(list)&&list.length===5&&list.every(validAnswer);}
  function fresh(scenario='vinegar',pattern='mixed') {
    if(!SCENARIOS[scenario])scenario='vinegar';if(!PATTERNS[pattern])pattern='mixed';
    const today=SCENARIOS[scenario].day;
    const records={};
    const count=scenario==='complete'?today:today-1;
    for(let day=1;day<=count;day++) {
      const value=PATTERNS[pattern][day-1];
      if(value===null)continue;
      records[day]={answers:[value,day%3===0?'Yes':'No',Math.max(1,value-1),day%4===0?'Yes':'No',Math.max(1,value-2)],amount:stage(day)===1?(['full','less','none','full','full','unknown','full'][(day-8)%7]):'not_due',recall:null,revisions:[]};
    }
    const current=records[today];
    return {version:1,scenario,pattern,today,section:'today',flow:current?'done':'home',step:0,answers:current?[...current.answers]:[null,null,null,null,null],amount:current?.amount||null,recall:current?.recall||null,coreSaved:!!current,signedIn:true,records};
  }
  function valid(saved) {
    return saved?.version===1&&SCENARIOS[saved.scenario]&&PATTERNS[saved.pattern]&&saved.today===SCENARIOS[saved.scenario].day&&['today','calendar','chart','guide'].includes(saved.section)&&['home','question','amount','recall','done'].includes(saved.flow)&&Number.isInteger(saved.step)&&saved.step>=0&&saved.step<5&&validAnswers(saved.answers)&&[null,'not_due',...AMOUNTS.map(x=>x.value)].includes(saved.amount)&&[null,'skipped',...RECALL.map(x=>x.value)].includes(saved.recall)&&typeof saved.signedIn==='boolean'&&saved.records&&Object.entries(saved.records).every(([day,record])=>Number.isInteger(Number(day))&&Number(day)>=1&&Number(day)<=saved.today&&validAnswers(record.answers)&&record.answers.every(a=>a!==null)&&[null,'not_due',...AMOUNTS.map(x=>x.value)].includes(record.amount)&&[null,'skipped',...RECALL.map(x=>x.value)].includes(record.recall)&&Array.isArray(record.revisions))&&(!saved.coreSaved||!!saved.records[saved.today])&&(!['amount','recall','done'].includes(saved.flow)||saved.coreSaved)&&(!['amount','recall'].includes(saved.flow)||stage(saved.today)===1)&&(!(saved.flow==='recall')||saved.amount==='none');
  }
  function createStore(id) {
    const key=`orchard-d-${id}-v1`;
    let state=fresh(),persistent=true;
    try{const saved=JSON.parse(sessionStorage.getItem(key));if(valid(saved))state=saved;}catch{persistent=false;}
    function save(){try{sessionStorage.setItem(key,JSON.stringify(state));persistent=true;}catch{persistent=false;}}
    function commitAnswers(){
      if(state.answers.some(v=>v===null))return false;
      const previous=state.records[state.today];
      if(!previous)state.records[state.today]={answers:[...state.answers],amount:stage(state.today)===1?null:'not_due',recall:null,revisions:[]};
      else if(JSON.stringify(previous.answers)!==JSON.stringify(state.answers)){previous.revisions.push({answers:[...previous.answers],amount:previous.amount,recall:previous.recall,changedAt:new Date().toISOString()});previous.answers=[...state.answers];}
      state.coreSaved=true;save();return true;
    }
    function commitUse(){const record=state.records[state.today];if(!record)return;if(record.amount!==state.amount||record.recall!==state.recall){if(record.amount!==null)record.revisions.push({answers:[...record.answers],amount:record.amount,recall:record.recall,changedAt:new Date().toISOString()});record.amount=state.amount;record.recall=state.recall;}save();}
    function edit(day,answers,amount){const record=state.records[day];if(!record||!validAnswers(answers)||answers.some(v=>v===null))return;const newRecall=amount===record.amount?record.recall:null;if(JSON.stringify(record.answers)!==JSON.stringify(answers)||record.amount!==amount){record.revisions.push({answers:[...record.answers],amount:record.amount,recall:record.recall,changedAt:new Date().toISOString()});record.answers=[...answers];record.amount=amount;record.recall=newRecall;if(day===state.today){state.answers=[...answers];state.amount=amount;state.recall=newRecall;}save();}}
    save();
    return {get state(){return state;},get persistent(){return persistent;},key,save,commitAnswers,commitUse,edit,reset(scenario='vinegar',pattern='mixed'){state=fresh(scenario,pattern);save();}};
  }
  window.ORCHARD_MODEL={TOPICS,QUESTIONS,EXPLANATIONS,SCALE,ACTIVITY_SCALE,AMOUNTS,RECALL,SCENARIOS,PATTERNS,stage,stageName,date,label,amountLabel,validAnswer,createStore};
})();
