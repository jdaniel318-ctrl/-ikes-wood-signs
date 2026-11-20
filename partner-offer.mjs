// Evaluate a partner's supplied inventory locally. Nothing here books a unit or publishes a rate.
export function previewOffer({capacity,booked,threshold,limit,rate,floor}){
 const values=[capacity,booked,threshold,limit,rate,floor];
 if(values.some(n=>!Number.isFinite(n))||![capacity,booked,limit].every(Number.isInteger)||capacity<1||booked<0||booked>capacity||limit<1||threshold<=0||threshold>100||floor<0||rate<=0)throw Error('Check capacity, reservations, offer limit, threshold and rates.');
 const occupancy=100*booked/capacity;
 const available=Math.min(limit,capacity-booked);
 if(occupancy>=threshold)return {eligible:false,occupancy,units:0,reason:'Occupancy is at or above the trigger.'};
 if(rate<floor)return {eligible:false,occupancy,units:0,reason:'The offer price is below the partner’s floor.'};
 return {eligible:true,occupancy,units:available,reason:'Eligible to propose for organizer review.'};
}
