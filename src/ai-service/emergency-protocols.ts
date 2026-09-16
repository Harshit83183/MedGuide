export const EMERGENCY_NUMBERS = [
  { label: 'Ambulance', number: '108', desc: 'Free govt ambulance service across India' },
  { label: 'National Emergency', number: '112', desc: 'Single emergency number — police, fire, medical' },
  { label: 'Women Helpline', number: '1091', desc: 'Women in distress' },
  { label: 'Child Helpline', number: '1098', desc: 'Child emergency' },
];

export const ER_STEPS = [
  { title: 'Stay calm, call 108', desc: 'Put phone on speaker. Tell operator: location, what happened, age of patient.' },
  { title: 'Do not move spine injuries', desc: 'After accidents/falls, keep the person still unless in danger (fire, traffic).' },
  { title: 'Stop heavy bleeding', desc: 'Press clean cloth firmly on the wound. Keep pressing till help arrives.' },
  { title: 'Chest pain? Chew aspirin only if advised', desc: 'Sit the person down, loosen clothes. Aspirin only if a doctor/operator says so.' },
];

export function sosMessage(lat: string, lng: string, name: string): string {
  const loc = lat && lng ? 'https://maps.google.com/?q=' + lat + ',' + lng : 'location unavailable';
  return 'MEDGUIDE SOS — ' + name + ' needs EMERGENCY help! Location: ' + loc + '. Please call back immediately.';
}
