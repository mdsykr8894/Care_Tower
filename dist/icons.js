/* Shared clean line icons for controls; keep decorative blossoms in the artwork. */
(() => { 'use strict';
const paths={
stack:'<rect x="3" y="15" width="18" height="6" rx="2"/><rect x="5" y="8" width="14" height="6" rx="2"/><path d="M8 4h8"/>',
book:'<path d="M12 7c-3-2-6-2-9-1v13c3-1 6-1 9 1 3-2 6-2 9-1V6c-3-1-6-1-9 1Z"/><path d="M12 7v13"/>',
trophy:'<path d="M7 4h10v8a5 5 0 0 1-10 0V4ZM7 6H4v2a4 4 0 0 0 4 4m9-6h3v2a4 4 0 0 1-4 4M12 17v3m-4 1h8"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2H3Zm12-14a3 3 0 0 1 0 6m1 4a5 5 0 0 1 5 4"/>',
hand:'<path d="M8 13V7a2 2 0 0 1 4 0v4-7a2 2 0 0 1 4 0v8-4a2 2 0 0 1 4 0v6c0 5-3 8-8 8H9c-2 0-4-1-5-4l-2-4a2 2 0 0 1 3-2l3 1"/>',
shield:'<path d="M12 2 21 6v6c0 5-4 8-9 10-5-2-9-5-9-10V6l9-4Z"/><path d="m8 12 3 3 5-6"/>',
expand:'<path d="M8 3H3v5M16 3h5v5M3 16v5h5m13-5v5h-5"/><path d="M3 8V3h5m8 0h5v5M3 16v5h5m8 0h5v-5"/>',
pause:'<path d="M8 5v14M16 5v14"/>',
play:'<path d="m8 5 11 7-11 7V5Z"/>',
refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5 9a8 8 0 0 1 14-2l1 5M4 12l1 5a8 8 0 0 0 14-2"/>',
volume:'<path d="M11 5 6 9H3v6h3l5 4V5ZM15 9a5 5 0 0 1 0 6M18 6a9 9 0 0 1 0 12"/>',
qr:'<path d="M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm3-8h1m10 0h1m-12 11h1m7-3h3m-3 4h2m3-5h2v3m-4 5h4v-3"/>',
award:'<circle cx="12" cy="8" r="5"/><path d="m9 13-2 9 5-3 5 3-2-9"/>',
};
window.CareIcons={make(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width','18');svg.setAttribute('height','18');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.9');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');svg.classList.add('care-ui-icon');svg.innerHTML=paths[name]||paths.shield;return svg;},apply(root=document){root.querySelectorAll('[data-care-icon]').forEach(el=>{const symbol=el.getAttribute('data-care-icon');el.replaceChildren(window.CareIcons.make(symbol));});}};
window.CareLabels={theme(value){return ({'Identify the Problem':'Identify the Problem','Initial Response':'First Response','Assess and Plan':'Assess & Plan','Evidence and Privacy':'Evidence & Privacy','Confidentiality':'Confidentiality','PDRM Referral':'PDRM Referral','External Consultation':'Agency Support','Fair Procedures':'Fair Procedures','Follow-up':'Follow-up','Monitor and Evaluate':'Monitor & Evaluate'})[value]||value;}};
window.CareIcons.apply();
})();
