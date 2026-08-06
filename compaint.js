// complaint.js - FULL CRUD + SEARCH + FILTER
import { db, storage, auth } from "./firebase-config.js";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

let allComplaints = [];
let currentUser = null;

auth.onAuthStateChanged(user => { currentUser = user; if(user) loadComplaints(); });

// --- CREATE ---
window.createComplaint = async function() {
  const title = document.getElementById('title').value.trim();
  const desc = document.getElementById('description').value.trim();
  const category = document.getElementById('category').value;
  const location = document.getElementById('location').value.trim();
  const file = document.getElementById('photo').files[0];

  if(!title ||!desc) return alert("Please fill title and description");
  if(!currentUser) return alert("Please login first");

  let photoURL = "";
  if(file){
    const storageRef = ref(storage, `complaints/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    photoURL = await getDownloadURL(storageRef);
  }

  await addDoc(collection(db, "complaints"), {
    title, description: desc, category, location,
    photoURL, status: "Pending", priority: "Medium",
    userId: currentUser.uid, userEmail: currentUser.email,
    createdAt: serverTimestamp()
  });
  alert("Complaint Created Successfully!");
  document.getElementById('complaintForm')?.reset();
  loadComplaints();
}

// --- READ + DISPLAY ---
async function loadComplaints() {
  if(!currentUser) return;
  const q = query(collection(db, "complaints"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  allComplaints = [];
  snap.forEach(d => allComplaints.push({ id: d.id,...d.data() }));
  renderComplaints(allComplaints);
}

function renderComplaints(data){
  const container = document.getElementById('complaintsList');
  if(!container) return;
  if(data.length === 0){ container.innerHTML = "<p>No complaints found.</p>"; return; }

  container.innerHTML = data.map(c => `
    <div class="complaint-card" style="border:1px solid #ddd; padding:12px; border-radius:10px; margin-bottom:10px; background:#fff">
      ${c.photoURL? `<img src="${c.photoURL}" style="width:100%; height:160px; object-fit:cover; border-radius:8px">` : ""}
      <h3>${c.title}</h3>
      <p><b>Category:</b> ${c.category} | <b>Status:</b> <span style="color:${c.status=='Resolved'?'green':c.status=='In Progress'?'orange':'red'}">${c.status}</span></p>
      <p>${c.description}</p>
      <p><small>${c.location} | ${c.createdAt?.toDate? c.createdAt.toDate().toLocaleString() : ''}</small></p>
      <div style="display:flex; gap:8px; margin-top:8px">
        <button onclick="editComplaint('${c.id}')" style="padding:6px 12px; background:#3b82f6; color:#fff; border:none; border-radius:6px; cursor:pointer">Update</button>
        <button onclick="deleteComplaint('${c.id}')" style="padding:6px 12px; background:#ef4444; color:#fff; border:none; border-radius:6px; cursor:pointer">Delete</button>
        ${c.status!=='Resolved'? `<button onclick="markResolved('${c.id}')" style="padding:6px