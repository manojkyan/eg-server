
export async function sendWhatsApp(to, message){
  // TODO: implement with your provider
  if(!process.env.WHATSAPP_API_URL) return { ok:false, message:"No provider configured" };
  return { ok:true, simulated:true, to, message };
}
