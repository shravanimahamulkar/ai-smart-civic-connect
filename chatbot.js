// AI CIVIC AGENT - USING YOUR KEY
const GEMINI_API_KEY=" your key";

const SYSTEM_PROMPT = `
You are AI Smart Civic Connect AI Agent.
Reply only in English.
Help with complaints: Garbage, Pothole, Street Light, Water Leakage.
Guide user to file complaint and check status.
Be friendly and concise.
`;

async function askGemini(userMessage, history=[]) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      ...history,
      { role: "user", parts: [{ text: userMessage }] }
    ]
  };
  const res = await fetch(url, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(body) });
  const data = await res.json();
  if(data.error) throw new Error(data.error.message);
  return data.candidates[0].content.parts[0].text;
}

let chatHistory = []; let isOpen = false;
function createChatUI(){
  if(document.getElementById('ai-agent-box')) return;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
  <style>
    #ai-agent-btn{position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;border:none;cursor:pointer;z-index:9999;font-size:28px}
    #ai-agent-box{position:fixed;bottom:90px;right:20px;width:360px;max-width:92vw;height:480px;background:#fff;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.25);display:none;flex-direction:column;z-index:9999;overflow:hidden;font-family:system-ui}
    #ai-agent-head{background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;padding:14px 16px;font-weight:700;display:flex;justify-content:space-between}
    #ai-agent-msgs{flex:1;overflow-y:auto;padding:12px;background:#f8fafc;display:flex;flex-direction:column;gap:10px}
    .msg{max-width:80%;padding:10px 12px;border-radius:12px;font-size:14px}
    .user{align-self:flex-end;background:#2563eb;color:#fff}
    .bot{align-self:flex-start;background:#fff;border:1px solid #e2e8f0}
    #ai-agent-input{display:flex;padding:10px;border-top:1px solid #e2e8f0;gap:8px}
    #ai-agent-input input{flex:1;padding:10px 12px;border-radius:20px;border:1px solid #cbd5e1;outline:none}
    #ai-agent-input button{background:#2563eb;color:#fff;border:none;padding:0 16px;border-radius:20px;cursor:pointer}
  </style>
  <button id="ai-agent-btn">🤖</button>
  <div id="ai-agent-box">
    <div id="ai-agent-head"><span>AI Civic Agent</span><span id="ai-close" style="cursor:pointer">X</span></div>
    <div id="ai-agent-msgs"><div class="msg bot">Hello! I am your Civic Assistant. How can I help you today?</div></div>
    <div id="ai-agent-input"><input id="ai-input" placeholder="Type message..." /><button id="ai-send">Send</button></div>
  </div>`;
  document.body.appendChild(wrapper);
  const btn=document.getElementById('ai-agent-btn'), box=document.getElementById('ai-agent-box'), close=document.getElementById('ai-close');
  btn.onclick=()=>{ isOpen=!isOpen; box.style.display=isOpen?'flex':'none'; };
  close.onclick=()=>{ isOpen=false; box.style.display='none'; };
  const input=document.getElementById('ai-input'), send=document.getElementById('ai-send'), msgs=document.getElementById('ai-agent-msgs');
  async function sendMsg(){
    const txt=input.value.trim(); if(!txt) return;
    msgs.innerHTML+=`<div class="msg user">${txt}</div>`; input.value=''; msgs.scrollTop=msgs.scrollHeight;
    chatHistory.push({role:"user", parts:[{text:txt}]});
    msgs.innerHTML+=`<div class="msg bot" id="typing">Typing...</div>`;
    try{
      const reply=await askGemini(txt, chatHistory);
      document.getElementById('typing')?.remove();
      msgs.innerHTML+=`<div class="msg bot">${reply}</div>`;
      chatHistory.push({role:"model", parts:[{text:reply}]});
    }catch(e){
      document.getElementById('typing')?.remove();
      msgs.innerHTML+=`<div class="msg bot" style="color:red">Error: ${e.message}</div>`;
    }
    msgs.scrollTop=msgs.scrollHeight;
  }
  send.onclick=sendMsg; input.onkeypress=e=>{ if(e.key==='Enter') sendMsg(); };
}
document.addEventListener('DOMContentLoaded', createChatUI);
