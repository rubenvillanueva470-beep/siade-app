function go(id){stopCamera();document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));window.scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
document.getElementById('profileForm').addEventListener('submit',e=>{e.preventDefault();if(e.target.reportValidity())go('workerPending')});
document.querySelectorAll('.approve,.deny').forEach(b=>b.addEventListener('click',()=>{b.closest('.request').querySelector('small').textContent='Demostración: '+(b.classList.contains('approve')?'aprobación':'denegación')+' seleccionada; no se guardó ningún cambio.'}));
let cameraStream=null,capturedBlob=null,capturedAt=null;
const video=document.getElementById('cameraVideo'),canvas=document.getElementById('cameraCanvas'),photo=document.getElementById('capturedPhoto');
function stopCamera(){if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;}if(video)video.srcObject=null;}
const status=document.getElementById('cameraStatus');
document.getElementById('startCamera').addEventListener('click',async()=>{
 try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('Este navegador no permite abrir la cámara desde esta dirección. Abre la aplicación mediante HTTPS o localhost en un navegador compatible.');stopCamera();cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});video.srcObject=cameraStream;video.hidden=false;photo.hidden=true;document.getElementById('cameraPlaceholder').hidden=true;document.getElementById('takePhoto').disabled=false;document.getElementById('sendCurrentMark').disabled=true;capturedBlob=null;status.textContent='Cámara activa. Encuadra la imagen y pulsa TOMAR FOTOGRAFÍA.';
 }catch(err){status.textContent=err.message||'No se pudo acceder a la cámara. Revisa los permisos del navegador.';}
});
document.getElementById('takePhoto').addEventListener('click',()=>{
 if(!cameraStream||!video.videoWidth){status.textContent='Espera a que la cámara esté lista.';return;}
 canvas.width=video.videoWidth;canvas.height=video.videoHeight;canvas.getContext('2d').drawImage(video,0,0);capturedAt=new Date();canvas.toBlob(blob=>{if(!blob){status.textContent='No se pudo capturar la fotografía.';return;}capturedBlob=blob;photo.src=URL.createObjectURL(blob);photo.hidden=false;video.hidden=true;stopCamera();document.getElementById('takePhoto').disabled=true;document.getElementById('sendCurrentMark').disabled=false;document.getElementById('currentCaptureInfo').hidden=false;document.getElementById('currentCaptureInfo').textContent='Fotografía capturada: '+capturedAt.toLocaleString('es-BO')+'. Tipo: '+document.getElementById('currentMarkType').value;status.textContent='Fotografía tomada directamente con la cámara. Puedes enviarla.';},'image/jpeg',0.88);
});
document.getElementById('sendCurrentMark').addEventListener('click',()=>{if(!capturedBlob){status.textContent='Primero debes tomar la fotografía.';return;}alert('Demostración: marcación actual enviada para revisión. Queda PENDIENTE DE APROBACIÓN de cualquiera de los dos administradores. No se registra como definitiva hasta ser aprobada.');go('workerDash');});
document.getElementById('sendPastMark').addEventListener('click',()=>{const d=document.getElementById('pastMarkDate').value,t=document.getElementById('pastMarkTime').value,r=document.getElementById('pastMarkReason').value.trim();if(!d||!t||!r){alert('Completa la fecha, hora y motivo de la marcación pasada.');return;}alert('Demostración: solicitud de marcación pasada enviada. Queda PENDIENTE DE APROBACIÓN de cualquiera de los dos administradores.');go('workerDash');});


// V8: generación de boletas y reportes imprimibles (datos de demostración)
const adminWorker=document.getElementById('adminWorker');
const adminPeriod=document.getElementById('adminPeriod');
const adminDocument=document.getElementById('adminDocument');
const printArea=document.getElementById('printArea');
const workerSamples={
 'TR-0487':{name:'Rubén Mamani Quispe',role:'Operador de Excavadora',salary:3300},
 'TR-0312':{name:'Carlos Flores Condori',role:'Ayudante',salary:3000},
 'TR-0521':{name:'María Quispe López',role:'Administrativa',salary:3600}
};
function selectedWorker(){return workerSamples[adminWorker.value]||workerSamples['TR-0487'];}
function openAdminDocument(title,content){
 document.getElementById('documentHeading').textContent=title;
 document.getElementById('printTitle').textContent=title;
 const w=selectedWorker(),period=adminPeriod.value||'Periodo no seleccionado';
 document.getElementById('printMeta').textContent=w.name+' · '+adminWorker.value+' · '+w.role+' · Periodo: '+period;
 document.getElementById('printContent').innerHTML=content;
 adminDocument.hidden=false;adminDocument.scrollIntoView({behavior:'smooth',block:'start'});
}
document.getElementById('makePayslip').addEventListener('click',()=>{
 const w=selectedWorker(),basic=w.salary,extra=0,absence=0,other=0,total=basic+extra-absence-other;
 const money=n=>'Bs '+n.toLocaleString('es-BO',{minimumFractionDigits:2,maximumFractionDigits:2});
 openAdminDocument('BOLETA DE PAGO',`<table class="print-table"><thead><tr><th>CONCEPTO</th><th>HABERES (Bs)</th><th>DESCUENTOS (Bs)</th></tr></thead><tbody><tr><td>Sueldo básico</td><td>${money(basic)}</td><td>—</td></tr><tr><td>Horas extraordinarias</td><td>${money(extra)}</td><td>—</td></tr><tr><td>Faltas / ausencias</td><td>—</td><td>${money(absence)}</td></tr><tr><td>Otros descuentos</td><td>—</td><td>${money(other)}</td></tr></tbody></table><div class="print-total">LÍQUIDO PAGABLE: ${money(total)}</div><p>Observaciones: valores ilustrativos del prototipo. La boleta definitiva se calculará con la planilla real de SIADE.</p>`);
});
document.getElementById('makeAttendance').addEventListener('click',()=>{
 const w=selectedWorker();
 openAdminDocument('REPORTE DE MARCACIONES',`<table class="print-table"><thead><tr><th>FECHA</th><th>DÍA</th><th>ENTRADA</th><th>SALIDA</th><th>HORAS</th><th>ESTADO</th></tr></thead><tbody><tr><td>02/11/2026</td><td>Lunes</td><td>08:00</td><td>18:00</td><td>8:00</td><td>Completa</td></tr><tr><td>03/11/2026</td><td>Martes</td><td>08:10</td><td>18:00</td><td>8:00</td><td>Completa</td></tr><tr><td>04/11/2026</td><td>Miércoles</td><td>—</td><td>18:00</td><td>—</td><td>Falta de entrada</td></tr><tr><td>05/11/2026</td><td>Jueves</td><td>—</td><td>—</td><td>—</td><td>FERIADO</td></tr></tbody></table><p><b>Resumen:</b> 2 jornadas completas · 1 incidencia · 1 feriado.</p><p>Este reporte es ilustrativo. En la versión conectada se utilizarán las marcaciones y eventos reales del trabajador.</p>`);
});
document.getElementById('printDocument').addEventListener('click',()=>window.print());
document.getElementById('closeDocument').addEventListener('click',()=>{adminDocument.hidden=true;document.getElementById('adminDash').scrollIntoView({behavior:'smooth'});});
