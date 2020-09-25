//Accedo a los elementos necesarios de dom
const body = document.querySelector("body");
//el contenedor, el mensaje en el centro, botones de abajo, overlay, botones su mensaje y la ventana
const dropzone = body.children[0].children[1];
const mensaje = dropzone.children[0];
const botonEnviar = body.children[0].children[4].children[0];
const botonEliminarTodo = body.children[0].children[4].children[1];
const overlay = body.children[0].children[3];
const si = overlay.children[0].children[1];
const no = overlay.children[0].children[2];
const icn_cerrar = document.querySelector('.icono-cerrar').children[0];
const mensajeVentana = overlay.children[0].children[0];
const ventana = mensajeVentana.parentNode;
const ventanaDeAudio = overlay.children[1];
const ampliarImagen = overlay.children[2].children[0];
const ampliarTexto = overlay.children[3];
const ventanaDeVideo = overlay.children[4];
console.log(icn_cerrar);

window.addEventListener('click', (e)=>{
  console.log(e.target)
  let preview = e.target.parentNode.className === 'padre'? e.target.parentNode : undefined;
  if(e.target.className === 'botonEliminar'){
    e.stopPropagation();
    e.preventDefault();
    //muestro el cuadro de confirmacion
    ventana.style.display = "grid";
    overlay.style.display="flex";
    let aceptar = function(){
      console.log(preview)
      ventana.style.display = "none";
      overlay.style.display="none";
      delete archivos[preview.id];
      dropzone.removeChild(preview);
      si.removeEventListener("click",aceptar);
      no.removeEventListener("click",cancelar);
      if(dropzone.childElementCount <= 1){
        mensaje.style.display = 'block';
        mensaje.style.fontSize = '20px';
      }
    };
    let cancelar = function(){
      //esta funcion no hace nada, solo ocultar la ventana de confirmacion
      overlay.style.display = "none";
      ventana.style.display = "none";
      si.removeEventListener("click",aceptar);
      no.removeEventListener("click",cancelar);
    }
    si.addEventListener("click", aceptar)
    no.addEventListener("click", cancelar)
  };
  if(e.target == overlay || e.target == icn_cerrar){
    overlay.style.display = 'none';
    ampliarImagen.parentNode.style.display = 'none';
    ventana.style.display = "none";
    ampliarTexto.style.display = 'none';
    ventanaDeVideo.style.display = 'none';
    ventanaDeVideo.src = "";
    ventanaDeAudio.style.display= "none";
    ventanaDeAudio.children[0].innerText = "Audio no disponible.";
    ventanaDeAudio.children[1].src = "";
  }
})
//objeto donde se almacenan los files
const archivos= {};
//objeto constructor
function Archivo(nombre, peso, tipo, file){
  var datos = {
    nombre:nombre,
    peso: peso,
    tipo: tipo,
    file: file
  }
  previeW: (function(){
    let div = document.createElement('div');//creo la caja
    let eNombre = document.createElement('p');
    let ePeso = document.createElement('p');
    let eTipo = document.createElement('p');
    let eliminar = document.createElement('button');
    eliminar.className = 'botonEliminar';
    eliminar.innerText = 'eliminar';
    div.className = 'padre';
    div.id = nombre;
    eNombre.innerText = nombre;
    ePeso.innerText = 'peso: '+ peso.toFixed(2) + "MB";
    div.appendChild(eNombre);
    tipo = tipo.split("/");
    tipo = tipo[0] == 'image' ? 'imagen' : tipo[0] == 'text' ? 'texto' : tipo[0] == 'video' ? 'video' : tipo[0] == 'audio' ? 'audio' : tipo[1] == 'pdf' ? 'pdf' : 'otro';
    eTipo.innerText ='tipo: '+tipo;
    div.appendChild(ePeso);
    div.appendChild(eTipo);
    div.appendChild(eliminar);
    console.log(div);
    getImage(tipo, file, div, eTipo)
  }())
  return datos;
};
//pasar los datos al constructor
let obtenerDatos = function(file){
  //Itero cada uno de los archivos
  for(i=0; i< file.length; i++){
    //declaro elementos del objeto por cada uno de los atributos del archivo
    archivos[file[i].name] = new Archivo(file[i].name, file[i].size/1024 /1024, file[i].type, file[i]);//almacena el file
  };
};
//obtener la imagen final del preview
let getImage = function(tipo, file, div, eTipo){
  switch (tipo) {
    case 'texto':
    console.log('texto plano')
    //creo el reader
    let readertxt = new FileReader();
    //obtengo el texto que contiene el file
    readertxt.readAsText(file);
    //espero que carge el reader
    readertxt.addEventListener("load", (e)=>{
      e.preventDefault();
      e.stopPropagation();
      let txt = e.target.result;
      //creo un contenedor para mostrar el contenido textual del file
      let cajita = document.createElement("div");
      //apendeo el texto contenido en el file a la cajita (contenedor)
      cajita.innerText = txt;
      cajita.className = "imagen-cajita";
      //apendeo el div al padre
      div.insertBefore(cajita, div.children[0]);
      dropzone.appendChild(div);
      cajita.addEventListener('click', (e)=>{
        e.stopPropagation();
        e.preventDefault();
        ampliarTexto.children[0].innerText = txt;
        overlay.style.display = 'flex';
        ampliarTexto.style.display = 'block';
      })
    });
      break;
    case 'imagen':
      console.log('imagen')
      //convierto el file en URL
      let url = URL.createObjectURL(file);
      //creo la etiqueta de imaagen que contendra el padre
      let img = document.createElement("img");
      //inserto el URL en el src de la imagen
      img.src = url;
      //le agrego una clase
      img.className = "imagen";
      //apendeo la imagen al padre
      div.insertBefore(img, div.children[0]);
      dropzone.appendChild(div);
      img.addEventListener('click', (e)=>{
        e.stopPropagation();
        e.preventDefault();
        overlay.style.display = 'flex';
        ampliarImagen.src = img.src;
        ampliarImagen.parentNode.style.display = 'inline-block';
      });
      break;
    case 'audio':
      console.log('audio');
      let imgAudio = document.createElement("img");
      //inserto el URL en el src de la imagen
      imgAudio.src = "audio.jpg";
      //le agrego una clase
      imgAudio.className = "imagen";
      //cambio el cursor a una barrita de progreso mientras se carga el video
      imgAudio.style.cursor = "wait";
      //apendeo la imagen al padre
      div.insertBefore(imgAudio, div.children[0]);
      //apendeo el padre a la dropzone
      dropzone.appendChild(div);
      //creo el reader para obtener el audio y reproducirlo en el overlay
      let readerAudio = new FileReader();
      //espero que carge el reader
      readerAudio.readAsDataURL(file);
      readerAudio.addEventListener("load", (e)=>{
        e.preventDefault();
        e.stopPropagation();
          //creo un url para acceder al video
          let urlAudio = e.target.result;
          console.log(ventanaDeAudio)
          imgAudio.style.cursor = "pointer";
          imgAudio.addEventListener("click", (e)=>{
            e.stopPropagation();
            e.preventDefault();
            overlay.style.display = "flex";
            ventanaDeAudio.children[0].innerText = file.name;
            ventanaDeAudio.children[1].src = urlAudio;
            ventanaDeAudio.style.display = "inline-block";
          });
        });
      break;
    case 'video':
      console.log('video');
      let imgVideo = document.createElement("img");
      //inserto el URL en el src de la imagen
      imgVideo.src = "video.jpg";
      //le agrego una clase
      imgVideo.className = "imagen";
      //cambio el cursor a una barrita de progreso mientras se carga el video
      imgVideo.style.cursor = "wait";
      //apendeo la imagen al padre
      div.insertBefore(imgVideo, div.children[0]);
      dropzone.appendChild(div);
      //creo el reader para obtener el video y mostrarlo en el overlay
      let reader = new FileReader();
      //espero que carge el reader
      reader.readAsDataURL(file);
      reader.addEventListener("load", (e)=>{
        e.preventDefault();
        e.stopPropagation();
          //creo un url para acceder al video
          let urlvideo = e.target.result;
          console.log(ventanaDeVideo)
          imgVideo.style.cursor = "pointer";
          imgVideo.addEventListener("click", (e)=>{
            e.stopPropagation();
            e.preventDefault();
            overlay.style.display = "flex";
            ventanaDeVideo.children[0].src = urlvideo;
            ventanaDeVideo.style.display = "inline-block";
        });
      });
      break;
    case 'pdf':
      console.log('pdf');
      //uso una imagen estandar para indicar que es pdf
        let imgpdf = document.createElement("img");
        imgpdf.className = "imagen";
        imgpdf.src = "pdf.png";
        div.insertBefore(imgpdf, div.children[0]);
        dropzone.appendChild(div);
        let urlpdf = URL.createObjectURL(file);
        console.log(urlpdf)
        imgpdf.addEventListener('click', (e)=>{
          e.stopPropagation();
          e.preventDefault();
          window.open(urlpdf, null, "width=600, height=600");
        })
      break
    case 'otro':
      console.log(tipo);
      //uso la extension como tipo
      let otroTipo = file.name;
      otroTipo= otroTipo.split('.');
      otroTipo= 'tipo: .' + otroTipo[otroTipo.length - 1];
      let otro = document.createElement("img")
      otro.className = "imagen";
      otro.src = "favicon.ico";
      otro.style.cursor = 'default';
      div.insertBefore(otro, div.children[0]);
      if(otroTipo !== '.undefined' && otroTipo.length <= 11){
         console.log(otroTipo.length)
        eTipo.innerText = otroTipo;
      };
      dropzone.appendChild(div);
      otro.addEventListener('click', (e)=>{
        e.stopPropagation();
        e.preventDefault();
      })
      break;
  };
};

//prevengo el default de todo en el window cuyo id sea distinto al de la dropzone, evitando que se abra el archivo si lo dropean fuera de la zona de drop (es necesario aplicar el prevent tanto a dragover como a drop)
window.addEventListener("dragenter", function(e) {
  if (e.target.id != dropzone.id) {
    e.preventDefault();
}
});
window.addEventListener("dragover", function(e) {
  if (e.target.id != dropzone.id) {
    e.preventDefault();
  }
});
window.addEventListener("drop", function(e) {
  if (e.target.id != dropzone.id) {
    e.preventDefault();
  }
});
//solo estilos
dropzone.addEventListener("dragover", (e)=>{
  e.preventDefault();
  e.stopPropagation();
  //como dragover me indica que el archivo esta dentro de la zona de drop, cambio el font-size del mensaje para indicarle al usuario que aqui es donde debe soltarlo
  mensaje.style.fontSize = "30px"
});
//solo estilos
dropzone.addEventListener("dragleave", (e)=>{
  e.preventDefault();
  e.stopPropagation();
  //como dragleave me indica que el archivo esta fuera de la zona de drop, preestablezco ell font-size del mensaje
  mensaje.style.fontSize = "20px";
});
//funcionalidad: el archivo ha sido ingresado a la zona de drop (mediante arrastre) y es cuando se puede acceder a sus elementos
dropzone.addEventListener("drop", (e)=>{
  e.preventDefault();
  e.stopPropagation();
  //borro el mensaje de la dropzone
  mensaje.style.display = "none";
  //dataTransfer.file me permite acceder al contenido del archivo en el evento drop
let file = e.dataTransfer.files;
obtenerDatos(file);
});
//funcionalidad: el archivo ha sido ingresado a la zona de drop (mediante un click) y es cuando se puede acceder a sus elementos}
input.addEventListener("change", (e)=>{
    e.stopPropagation();
      console.log('click')
      //borro el mensaje de la dropzone
      mensaje.style.display = "none";
      //files me permite acceder a los archivos desde el evento change
      let file = e.target.files;
      obtenerDatos(file);
    });
input.addEventListener('click', (e)=>{
  e.stopPropagation()
})
