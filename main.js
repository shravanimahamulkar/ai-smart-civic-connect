function getLocation(){
 navigator.geolocation.getCurrentPosition(p=>{
   document.getElementById('loc').value = p.coords.latitude+","+p.coords.longitude;
 });
}