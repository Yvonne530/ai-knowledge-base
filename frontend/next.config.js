/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      appDir: true,
    },
    env: {
      BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3001',
    },
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/:path*`,
        },
      ];
    },
  };
  
  module.exports = nextConfig;
  <SD1>/**   @Type   {  import  （ 'nex t' ） 。  nextConfig  } }   */  const   nextConfig   =   { 实验 ：   {  appdir  ：  trie </s d21> ， }  ，   envy  ：  {  backend_url  ：  process  。  env  。   backend_url </sdend_url   || http：// localhost：3001' ， }  ，  async  /sd41> （ ）  { 返回   [ rce  ： '/api/：path*' ，  destinaty D54>`  $ {  process  。   envy  envy   _url   ||  'http：// localhost：3001' } }  /api/api/：path*</api/：path*  <sd6 5>` ， }  ， ] ]  ; ;   <sd71> <sd71> <sd71> <sd71>} </sd71     D72> }  ;   module   。   exports     =  =      NextConfig  <SD80>; 