/* A session-local course. Hosts provide their own station IDs, grading and presentation. */
(function(root) {
  "use strict";
  function create(stations) {
    return {stations:stations.slice(),index:0,transfer:false,results:[],graded:false};
  }
  function current(run) {
    const station=run.stations[run.index];
    return station && {skill:station.skill,context:run.transfer?station.alternate:station.context};
  }
  function record(run, correct, assisted=false) {
    if(run.graded || !current(run))return;
    run.results.push({...current(run),transfer:run.transfer,correct:!!correct,assisted:!!assisted});
    run.graded=true;
  }
  function next(run) {
    if(!run.graded)return;
    const result=run.results[run.results.length-1];
    if(!run.transfer && (!result.correct || result.assisted))run.transfer=true;
    else {run.index++;run.transfer=false;}
    run.graded=false;
  }
  function summary(run) {
    const first=run.results.filter(r=>!r.transfer);
    const transfer=run.results.filter(r=>r.transfer);
    return {first:first.filter(r=>r.correct&&!r.assisted).length,
      total:first.length,transferCorrect:transfer.filter(r=>r.correct&&!r.assisted).length,transferTotal:transfer.length};
  }
  root.FleetPracticeCircuit={create,current,record,next,summary};
  if(typeof module!=="undefined" && module.exports)module.exports=root.FleetPracticeCircuit;
})(globalThis);
