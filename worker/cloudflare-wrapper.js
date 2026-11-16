// Cloudflare supplies ctx.access after validating the Worker's Access policy.
// Client-supplied identity headers never establish authorization.
export default {
 async fetch(request, env, ctx) {
  const url=new URL(request.url);
  if(url.pathname==='/health'&&request.method==='GET')return Response.json({application:'player-research',version:'cloudflare-1',status:'deployed'},{headers:{'Cache-Control':'no-store'}});
  if(!ctx?.access)return new Response('Sign-in protection is not active. Access to research is disabled.',{status:401,headers:{'Cache-Control':'no-store'}});
  let identity;
  try{identity=await ctx.access.getIdentity();}catch{return new Response('Unable to verify sign-in.',{status:401});}
  if(!identity?.email)return new Response('A verified email identity is required.',{status:403});
  const trustedHeaders=new Headers(request.headers);
  trustedHeaders.delete('oai-authenticated-user-id');
  trustedHeaders.delete('oai-authenticated-user-email');
  trustedHeaders.set('oai-authenticated-user-id',identity.email);
  trustedHeaders.set('oai-authenticated-user-email',identity.email);
  return app.fetch(new Request(request,{headers:trustedHeaders}),env,ctx);
 }
};
