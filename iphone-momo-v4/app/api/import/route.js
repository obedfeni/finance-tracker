
export async function POST(req){
 const {text}=await req.json();
 const amt=(text.match(/(\d+(?:\.\d+)?)/)||[])[1]||0;
 const lower=text.toLowerCase();
 const type=/(received|credited)/.test(lower)?'income':'expense';
 const category=/(airtime)/.test(lower)?'airtime':/(transfer)/.test(lower)?'transfer':'general';
 return Response.json({item:{date:new Date().toISOString().slice(0,10),type,category,amount:Number(amt)}})
}
