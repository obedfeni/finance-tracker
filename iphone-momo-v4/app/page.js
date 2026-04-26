
'use client'
import {useState,useEffect} from 'react';
export default function Page(){
 const [items,setItems]=useState([]),[txt,setTxt]=useState('');
 useEffect(()=>{const s=localStorage.getItem('iphonev4'); if(s) setItems(JSON.parse(s));},[]);
 useEffect(()=>localStorage.setItem('iphonev4',JSON.stringify(items)),[items]);
 async function imp(){
  const r=await fetch('/api/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:txt})});
  const d=await r.json(); if(d.item) setItems([d.item,...items]); setTxt('');
 }
 const bal=items.reduce((a,x)=>a+(x.type==='income'?x.amount:-x.amount),0);
 return <div>
 <h1>iPhone MoMo Finance V4</h1>
 <p>Use Apple Shortcuts: Share SMS text into this app endpoint.</p>
 <p>Balance: GHS {bal.toFixed(2)}</p>
 <textarea rows='5' cols='60' value={txt} onChange={e=>setTxt(e.target.value)} placeholder='Paste MoMo SMS'></textarea><br/>
 <button onClick={imp}>Import SMS</button>
 <h3>Transactions</h3>
 <ul>{items.map((x,i)=><li key={i}>{x.date} {x.type} {x.category} GHS {x.amount}</li>)}</ul>
 </div>
}
