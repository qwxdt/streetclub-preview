/* Street Club — общий JS страниц многостраничника (раздел, товар, корзина).
   Данные: window.SC_ITEMS / SC_CATS / SC_D из assets/data.js (генерирует proto/mp/build.py).
   Корзина — localStorage 'sc_cart' (та же, что в одностраничнике), язык — 'sc_lang'. */
(function(){
'use strict';
var ITEMS=window.SC_ITEMS,D=window.SC_D,CATS=window.SC_CATS.map(function(c){return c[0]}),SLUG={};
window.SC_CATS.forEach(function(c){SLUG[c[0]]=c[1]});
var R=document.documentElement.getAttribute('data-root')||'';
var PAGE_KIND=document.body.getAttribute('data-page');
var STOCK_DAYS=[1,2],ORDER_DAYS=[18,22],ORDER_SPREAD=2,PREPAY_PCT=30,ORDER_SIZES=['S','M','L','XL'],SHOE_SIZES=['38','39','40','41','42','43','44','45'],PAGE=24,TG='danilovidd';
var BY={};ITEMS.forEach(function(x){BY[x.id]=x});
var ORDER_SPAN=(function(){var a=99,b=0;ITEMS.forEach(function(x){if(x.m==='or'&&x.d){a=Math.min(a,x.d[0]);b=Math.max(b,x.d[1])}});return a<b?a+'–'+b:String(b||ORDER_DAYS[1])})();
var MONTHS={ru:['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],ua:['січня','лютого','березня','квітня','травня','червня','липня','серпня','вересня','жовтня','листопада','грудня']};
/* строки, которых нет в словаре одностраничника */
var EX={
 ru:{home:'Главная',filters:'Фильтры',f_reset:'Сбросить',f_show:'Показать {n}',f_avail:'Наличие',f_size:'Размер',f_brand:'Бренд',f_price:'Цена, ₴',f_from:'от',f_to:'до',f_nob:'без бренда',f_none:'Под эти фильтры ничего нет',
  sim_h:'Похожие вещи',sim_all:'Весь раздел',perk1:'Доставка Новой Почтой по всей Украине',perk2:'Вопросы по вещи — менеджеру в Telegram',cont:'Продолжить покупки',c_all:'Все'},
 ua:{home:'Головна',filters:'Фільтри',f_reset:'Скинути',f_show:'Показати {n}',f_avail:'Наявність',f_size:'Розмір',f_brand:'Бренд',f_price:'Ціна, ₴',f_from:'від',f_to:'до',f_nob:'без бренду',f_none:'Під ці фільтри нічого немає',
  sim_h:'Схожі речі',sim_all:'Весь розділ',perk1:'Доставка Новою Поштою по всій Україні',perk2:'Питання щодо речі — менеджеру в Telegram',cont:'Продовжити покупки',c_all:'Усі'}};
['ru','ua'].forEach(function(l){for(var k in EX[l])D[l][k]=EX[l][k]});

/* ---------- helpers ---------- */
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var lang='ru';try{var sl=localStorage.getItem('sc_lang');if(sl==='ua'||sl==='ru')lang=sl}catch(e){}
function t(k,v){var s=D[lang]&&D[lang][k];if(s==null){console.warn('i18n miss',lang,k);return k}if(v)for(var x in v)s=s.split('{'+x+'}').join(v[x]);return s}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function kop(u){return u*100}
function money(k){var u=Math.floor(k/100),r=k%100,s=String(u).replace(/\B(?=(\d{3})+(?!\d))/g,'\u00a0');if(r)s+=','+(r<10?'0':'')+r;return s+'\u00a0'+t('uah')}
function words(n){var a=n%10,b=n%100;return n+' '+t(a===1&&b!==11?'w1':(a>=2&&a<=4&&(b<10||b>=20))?'w2':'w5')}
function baseDate(){var m=/[?&]today=(\d{4})-(\d{2})-(\d{2})/.exec(location.search);if(m)return {y:+m[1],m:+m[2]-1,d:+m[3]};var n=new Date();return {y:n.getFullYear(),m:n.getMonth(),d:n.getDate()}}
function plus(n){var b=baseDate(),x=new Date(Date.UTC(b.y,b.m,b.d+n));return {m:x.getUTCMonth(),d:x.getUTCDate()}}
function range(a,b){var x=plus(a),y=plus(b),M=MONTHS[lang];if(a===b)return x.d+'\u00a0'+M[x.m];if(x.m===y.m)return x.d+'–'+y.d+'\u00a0'+M[y.m];return x.d+'\u00a0'+M[x.m]+' – '+y.d+'\u00a0'+M[y.m]}
function daysOf(it){var d=it.d||(it.m==='st'?STOCK_DAYS:ORDER_DAYS);return it.m==='st'?[d[0],Math.max(d[1],d[0]+1)]:[d[0],Math.max(d[1],d[0])+ORDER_SPREAD]}
function lead(it){var d=it.d||ORDER_DAYS;return d[0]===d[1]?String(d[0]):d[0]+'–'+d[1]}
function dateOf(it){var d=daysOf(it);return range(d[0],d[1])}
var CAT_OF={hoodie:'hood',zip:'hood',knit:'knit',crew:'knit',long:'tee',tee:'tee',polo:'tee',pants:'pants',jeans:'pants',shorts:'pants',jacket:'outer',biker:'outer',shoes:'shoes',kedy:'shoes',clogs:'shoes'};
var ACC={belt:1,bag:1,cap:1,hat:1,beanie:1,pendant:1,bracelet:1,ring:1,glasses:1,wallet:1,watch:1};
function catOf(it){return CAT_OF[it.ty]||'acc'}
function sizesOf(it){return it.s||(ACC[it.ty]?['ONE']:catOf(it)==='shoes'?SHOE_SIZES:ORDER_SIZES)}
function sizeLbl(s){return s==='ONE'?t('size_one'):s}
function cardTitle(it){var ty=t('t_'+it.ty);ty=ty.charAt(0).toUpperCase()+ty.slice(1);return it.b?ty+' '+it.b:ty}
function tImg(it){return R+'img/t/'+it.id+'.webp'}
function pHref(it){return R+'product/'+it.id+'/'}
function cHref(c){return R+'catalog/'+(c&&c!=='all'&&c!=='new'?SLUG[c]+'/':'')}
function norm(s){return String(s).toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-яіїєґ0-9]+/g,' ').trim()}
function hay(it){return norm([it.b,D.ru['t_'+it.ty],D.ua['t_'+it.ty],D.ru['c_'+catOf(it)],D.ua['c_'+catOf(it)]].join(' '))}
function matches(it,q){var h=hay(it);return norm(q).split(' ').every(function(w){return !w||h.indexOf(w)>=0||h.split(' ').some(function(x){return x.indexOf(w)===0})})}
var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
var ARW='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

/* ---------- корзина (общая) ---------- */
var cart=[];
function loadCart(){try{cart=JSON.parse(localStorage.getItem('sc_cart')||'[]').filter(function(c){return BY[c.id]}).map(function(c){return {id:c.id,size:c.size,q:Math.max(1,Math.min(9,c.q|0||1))}})}catch(e){cart=[]}}
loadCart();
function save(){try{localStorage.setItem('sc_cart',JSON.stringify(cart))}catch(e){}}
function cnt(){return cart.reduce(function(a,c){return a+c.q},0)}
function renderCartBtn(){var b=$('#cartN');if(!b)return;b.textContent=cnt();b.hidden=!cart.length}
function bump(){var b=$('#cartN');b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump')}
addEventListener('storage',function(e){if(e.key==='sc_cart'){loadCart();renderCartBtn();if(PAGE_KIND==='cart')renderCart()}});
addEventListener('pageshow',function(e){if(e.persisted){loadCart();renderCartBtn();if(PAGE_KIND==='cart')renderCart()}});

/* ---------- переводы статики ---------- */
function applyStatic(){
  document.documentElement.lang=lang==='ua'?'uk':'ru';
  $$('[data-i]').forEach(function(e){e.textContent=t(e.getAttribute('data-i'))});
  $$('[data-ip]').forEach(function(e){e.placeholder=t(e.getAttribute('data-ip'))});
  $$('[data-ia]').forEach(function(e){e.setAttribute('aria-label',t(e.getAttribute('data-ia')))});
  $$('.lang button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.l===lang)});
}

/* ---------- слои ---------- */
var LAYERS='.nav.on,.srch.on,.md.on,.fsh.on';
function lockOn(){document.documentElement.classList.add('lock')}
function lockOff(){if(!document.querySelector(LAYERS)){document.documentElement.classList.remove('lock');$('#scrim').classList.remove('on','nv')}}
function show(sel){$(sel).classList.add('on');$('#scrim').classList.add('on');lockOn()}
function hide(sel){var e=$(sel);if(e)e.classList.remove('on');lockOff()}
var tt;function toast(m){var e=$('#toast');e.textContent=m;e.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){e.classList.remove('on')},2200)}
function openMd(k){var o={offer:['l_offer','lg_offer'],ret:['l_ret','lg_ret'],ship:['l_ship','lg_ship']}[k];if(!o)return;
  $('#mdH').textContent=t(o[0]);$('#mdB').innerHTML=t(o[1],{p:PREPAY_PCT,a:STOCK_DAYS.join('–'),b:ORDER_SPAN});show('#md');$('#mdX').focus({preventScroll:true})}

/* меню */
function openNav(){if($('#nav').classList.contains('on')){closeNav();return}closeSearch();document.documentElement.classList.add('navon');$('#nav').classList.add('on');$('#nav').setAttribute('aria-hidden','false');$('#burg').setAttribute('aria-expanded','true');$('#scrim').classList.add('on','nv');lockOn()}
function closeNav(){if(!$('#nav').classList.contains('on'))return;document.documentElement.classList.remove('navon');$('#nav').classList.remove('on');$('#nav').setAttribute('aria-hidden','true');$('#burg').setAttribute('aria-expanded','false');lockOff()}
$('#burg').addEventListener('click',openNav);
$('#nav').addEventListener('click',function(e){if(e.target.closest('[data-navclose]'))closeNav()});
(function(){var hdr=$('#hdr'),mega=$('#mega'),tm;
  function on(){clearTimeout(tm);mega.classList.add('on');var b=$('#dnav [data-mega]');if(b)b.classList.add('hov')}
  function off(){tm=setTimeout(function(){mega.classList.remove('on');var b=$('#dnav [data-mega]');if(b)b.classList.remove('hov')},140)}
  $('#dnav').addEventListener('mouseover',function(e){if(e.target.closest('[data-mega]'))on();else if(e.target.closest('a'))off()});
  mega.addEventListener('mouseenter',on);mega.addEventListener('mouseleave',off);hdr.addEventListener('mouseleave',off);
})();
addEventListener('scroll',function(){$('#hdr').classList.toggle('sc',scrollY>8)},{passive:true});

/* поиск */
function openSearch(){closeNav();$('#srch').classList.add('on');$('#scrim').classList.add('on');lockOn();setTimeout(function(){$('#sq').focus()},RM?0:120);renderSearch()}
function closeSearch(){if(!$('#srch').classList.contains('on'))return;$('#srch').classList.remove('on');$('#sq').blur();lockOff()}
function renderSearch(){
  var q=$('#sq').value.trim(),Rr=$('#srRes');
  if(!q){Rr.innerHTML='<div class="sr-pop">'+CATS.map(function(c){return '<a href="'+cHref(c)+'">'+t('c_'+c)+'</a>'}).join('')+'</div>';return}
  var L=ITEMS.filter(function(i){return matches(i,q)});
  if(!L.length){Rr.innerHTML='<div class="none">'+t('s_none')+'</div>';return}
  Rr.innerHTML=L.slice(0,6).map(function(i){return '<a class="sr-i" href="'+pHref(i)+'"><img src="'+tImg(i)+'" alt="" width="480" height="480" loading="lazy"><span><b>'+esc(cardTitle(i))+'</b><small>'+money(kop(i.p))+'</small></span></a>'}).join('')
   +'<a class="btn sr-all" href="'+R+'catalog/?q='+encodeURIComponent(q)+'">'+t('s_all',{n:L.length})+'</a>'}
$('#srBtn').addEventListener('click',openSearch);
$('#srX').addEventListener('click',closeSearch);
$('#sq').addEventListener('input',renderSearch);
$('#sq').addEventListener('keydown',function(e){if(e.key==='Enter'&&this.value.trim()){e.preventDefault();location.href=R+'catalog/?q='+encodeURIComponent(this.value.trim())}});
$('#scrim').addEventListener('click',function(){closeNav();closeSearch();hide('#md');closeF()});
$('#mdX').addEventListener('click',function(){hide('#md')});
document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;
  if($('#md').classList.contains('on')){hide('#md');return}
  if($('#fsh')&&$('#fsh').classList.contains('on')){closeF();return}
  if($('#srch').classList.contains('on')){closeSearch();return}
  closeNav()});
document.addEventListener('click',function(e){
  var md=e.target.closest('[data-md]');if(md){e.preventDefault();openMd(md.dataset.md);return}
  var l=e.target.closest('.lang button');if(l){lang=l.dataset.l;try{localStorage.setItem('sc_lang',lang)}catch(x){}rerender();return}
  var a=e.target.closest('a[href="#contacts"]');if(a){closeNav()}
});

/* появление карточек — как в одностраничнике */
var io=('IntersectionObserver' in window)&&!RM?new IntersectionObserver(function(es){
  es.filter(function(e){return e.isIntersecting}).map(function(e){return e.target}).forEach(function(el,n){el.style.transitionDelay=Math.min(n,7)*55+'ms';el.classList.add('in');io.unobserve(el)});
},{rootMargin:'0px 0px -6% 0px'}):null;
function watch(els){els.forEach(function(el){if(io){el.classList.add('rv');io.observe(el)}})}
var rvT=0;addEventListener('scroll',function(){if(!io||rvT)return;rvT=setTimeout(function(){rvT=0;var H=innerHeight;$$('.rv:not(.in)').forEach(function(el){if(el.getBoundingClientRect().top<H){el.classList.add('in');io.unobserve(el)}})},120)},{passive:true});

function tagHTML(it){return it.m==='st'?'<span class="tag st">'+t('tag_st')+'</span>':'<span class="tag or">'+t('tag_or',{n:lead(it)})+'</span>'}
function cardHTML(i){return '<a class="card" href="'+pHref(i)+'"><div class="ph"><img src="'+tImg(i)+'" width="480" height="480" loading="lazy" decoding="async" alt="'+esc(cardTitle(i))+'">'+tagHTML(i)+'</div><div class="t">'+esc(cardTitle(i))+'</div><div class="p">'+money(kop(i.p))+'</div></a>'}

/* =================== РАЗДЕЛ =================== */
var SEC=null;
function initSection(){
  var cat=document.body.getAttribute('data-cat');
  var P=new URLSearchParams(location.search);
  var st={q:P.get('q')||'',av:(P.get('av')||'').split(',').filter(Boolean),sz:(P.get('size')||'').split(',').filter(Boolean),br:(P.get('brand')||'').split('|').filter(Boolean),
    pmin:+P.get('pmin')||0,pmax:+P.get('pmax')||0,sort:P.get('sort')||'new',shown:PAGE};
  var BASE=ITEMS.filter(function(i){return cat==='all'||catOf(i)===cat});
  SEC={cat:cat,st:st,base:BASE,draft:null};
  $('#sort').value=st.sort;
  $('#sort').addEventListener('change',function(){st.sort=this.value;st.shown=PAGE;syncUrl();renderSec()});
  $('#more').addEventListener('click',function(){var L=secList(st),from=st.shown;st.shown=Math.min(st.shown+PAGE,L.length);
    var tmp=document.createElement('div');tmp.innerHTML=L.slice(from,st.shown).map(cardHTML).join('');var els=$$('.card',tmp);els.forEach(function(e){$('#grid').appendChild(e)});watch(els);moreUI(L.length)});
  $('#fOpen').addEventListener('click',openF);
  $('#fshX').addEventListener('click',closeF);
  $('#fApply').addEventListener('click',function(){Object.assign(st,SEC.draft);st.shown=PAGE;syncUrl();closeF();renderSec();var g=$('.tools');if(g&&g.getBoundingClientRect().top<0)g.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'})});
  $('#fReset').addEventListener('click',function(){SEC.draft={av:[],sz:[],br:[],pmin:0,pmax:0};renderF()});
  $('#fshB').addEventListener('click',function(e){var b=e.target.closest('[data-fk]');if(!b)return;var k=b.dataset.fk,v=b.dataset.fv,a=SEC.draft[k],i=a.indexOf(v);if(i>=0)a.splice(i,1);else a.push(v);renderF()});
  $('#fshB').addEventListener('input',function(e){if(e.target.id==='pMin'||e.target.id==='pMax'){SEC.draft[e.target.id==='pMin'?'pmin':'pmax']=+e.target.value.replace(/\D/g,'')||0;updF()}});
  $('#chips').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var k=b.dataset.k,v=b.dataset.v;
    if(k==='q'){if(cat==='all'&&st.q){st.q=''}}else if(k==='p'){st.pmin=0;st.pmax=0}else if(k==='all'){st.av=[];st.sz=[];st.br=[];st.pmin=0;st.pmax=0;st.q=''}else{st[k]=st[k].filter(function(x){return x!==v})}
    st.shown=PAGE;syncUrl();renderSec()});
  renderSec();
}
function secList(s,skipSort){
  var L=SEC.base.filter(function(i){
    if(s.q&&!matches(i,s.q))return false;
    if(s.av.length&&s.av.indexOf(i.m)<0)return false;
    if(s.sz.length&&!sizesOf(i).some(function(z){return s.sz.indexOf(z)>=0}))return false;
    if(s.br.length&&s.br.indexOf(i.b||'-')<0)return false;
    if(s.pmin&&i.p<s.pmin)return false;if(s.pmax&&i.p>s.pmax)return false;return true});
  if(!skipSort){if(s.sort==='lo')L=L.slice().sort(function(a,b){return a.p-b.p||b.id-a.id});else if(s.sort==='hi')L=L.slice().sort(function(a,b){return b.p-a.p||b.id-a.id})}
  return L}
function nF(s){return s.av.length+s.sz.length+s.br.length+(s.pmin||s.pmax?1:0)}
function syncUrl(){var s=SEC.st,P=new URLSearchParams();if(s.q)P.set('q',s.q);if(s.av.length)P.set('av',s.av.join(','));if(s.sz.length)P.set('size',s.sz.join(','));if(s.br.length)P.set('brand',s.br.join('|'));if(s.pmin)P.set('pmin',s.pmin);if(s.pmax)P.set('pmax',s.pmax);if(s.sort!=='new')P.set('sort',s.sort);
  var m=/[?&](today=[^&]+)/.exec(location.search);var qs=P.toString()+(m?(P.toString()?'&':'')+m[1]:'');
  try{history.replaceState(null,'',location.pathname+(qs?'?'+qs:''))}catch(e){}}
function moreUI(n){var a=Math.min(SEC.st.shown,n);$('#shown').textContent=n?t('shown',{a:a,b:n}):'';$('#more').hidden=a>=n;$('#shownBar').style.transform='scaleX('+(n?a/n:0)+')';$('.shown').hidden=!n}
function renderSec(){
  var s=SEC.st,L=secList(s);
  var H=$('#catH');
  if(s.q&&SEC.cat==='all'){H.removeAttribute('data-i');H.textContent=t('s_res',{q:s.q})}else{H.setAttribute('data-i',SEC.cat==='all'?'all_items':'c_'+SEC.cat);H.textContent=t(H.getAttribute('data-i'))}
  $('#catN').textContent=words(L.length);
  $('#grid').innerHTML=L.length?L.slice(0,s.shown).map(cardHTML).join(''):'<div class="none">'+t(nF(s)||s.q?'f_none':'s_none')+'</div>';
  watch($$('#grid .card'));moreUI(L.length);
  var n=nF(s);$('#fCnt').hidden=!n;$('#fCnt').textContent=n;
  var ch=[];
  if(s.q)ch.push(['q','',s.q]);
  s.av.forEach(function(v){ch.push(['av',v,t(v==='st'?'f_stock':'f_order')])});
  s.sz.forEach(function(v){ch.push(['sz',v,sizeLbl(v)])});
  s.br.forEach(function(v){ch.push(['br',v,v==='-'?t('f_nob'):v])});
  if(s.pmin||s.pmax)ch.push(['p','',(s.pmin?t('f_from')+' '+s.pmin:'')+(s.pmin&&s.pmax?' ':'')+(s.pmax?t('f_to')+' '+s.pmax:'')+' ₴']);
  $('#chips').innerHTML=ch.map(function(c){return '<button type="button" data-k="'+c[0]+'" data-v="'+esc(c[1])+'">'+esc(c[2])+'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'}).join('')+(ch.length>1?'<button type="button" class="clr" data-k="all">'+t('f_reset')+'</button>':'');
  $('#chips').hidden=!ch.length;
  $$('#menu a').forEach(function(a){if(s.q&&SEC.cat==='all')a.removeAttribute('aria-current')});
}
function openF(){var s=SEC.st;SEC.draft={av:s.av.slice(),sz:s.sz.slice(),br:s.br.slice(),pmin:s.pmin,pmax:s.pmax};renderF();show('#fsh');$('#fsh .fsh-b').scrollTop=0;$('#fshX').focus({preventScroll:true})}
function closeF(){var f=$('#fsh');if(f&&f.classList.contains('on'))hide('#fsh')}
var SZ_ORDER=['XS','S','M','L','L(XL)','XL','XXL','ONE'];
function renderF(){
  var d=SEC.draft,B=SEC.base.filter(function(i){return !SEC.st.q||matches(i,SEC.st.q)});
  function all(fn){var m={};B.forEach(function(i){fn(i).forEach(function(k){m[k]=0})});return m}
  /* фасетные счётчики: группа считается с учётом остальных выбранных фильтров */
  function cntBy(skip,fn){var m=all(fn),f={q:SEC.st.q,av:skip==='av'?[]:d.av,sz:skip==='sz'?[]:d.sz,br:skip==='br'?[]:d.br,pmin:d.pmin,pmax:d.pmax};
    secList(f,true).forEach(function(i){fn(i).forEach(function(k){m[k]=(m[k]||0)+1})});return m}
  var avC=cntBy('av',function(i){return [i.m]}),szC=cntBy('sz',function(i){return sizesOf(i)}),brC=cntBy('br',function(i){return [i.b||'-']});
  var szs=Object.keys(szC).sort(function(a,b){var x=SZ_ORDER.indexOf(a),y=SZ_ORDER.indexOf(b);if(x<0&&y<0)return parseFloat(a)-parseFloat(b)||a.localeCompare(b);if(x<0)return 1;if(y<0)return -1;return x-y});
  var brs=Object.keys(brC).sort(function(a,b){if(a==='-')return 1;if(b==='-')return -1;return brC[b]-brC[a]||a.localeCompare(b)});
  var pr=B.map(function(i){return i.p}),lo=Math.min.apply(0,pr),hi=Math.max.apply(0,pr);
  function chip(k,v,lbl,n){var on=d[k].indexOf(v)>=0;return '<button type="button" class="fc'+(k==='br'?' row':'')+(!n&&!on?' zero':'')+'" data-fk="'+k+'" data-fv="'+esc(v)+'" aria-pressed="'+on+'"><span>'+esc(lbl)+'</span><small>'+n+'</small></button>'}
  var h='';
  h+='<div class="fg"><h4>'+t('f_avail')+'</h4><div class="fcs">'+['st','or'].filter(function(v){return v in avC}).map(function(v){return chip('av',v,t(v==='st'?'f_stock':'f_order'),avC[v])}).join('')+'</div></div>';
  if(szs.length>1)h+='<div class="fg"><h4>'+t('f_size')+'</h4><div class="fcs">'+szs.map(function(v){return chip('sz',v,sizeLbl(v),szC[v])}).join('')+'</div></div>';
  if(brs.length>1)h+='<div class="fg"><h4>'+t('f_brand')+'</h4><div class="fcs brs">'+brs.map(function(v){return chip('br',v,v==='-'?t('f_nob'):v,brC[v])}).join('')+'</div></div>';
  if(lo<hi)h+='<div class="fg"><h4>'+t('f_price')+'</h4><div class="prc"><label><span>'+t('f_from')+'</span><input id="pMin" inputmode="numeric" placeholder="'+lo+'" value="'+(d.pmin||'')+'"></label><i></i><label><span>'+t('f_to')+'</span><input id="pMax" inputmode="numeric" placeholder="'+hi+'" value="'+(d.pmax||'')+'"></label></div></div>';
  var sc=$('#fshB').scrollTop;$('#fshB').innerHTML=h;$('#fshB').scrollTop=sc;updF()}
function updF(){var d=SEC.draft,n=secList({q:SEC.st.q,av:d.av,sz:d.sz,br:d.br,pmin:d.pmin,pmax:d.pmax,sort:'new'},true).length;
  $('#fApply').textContent=t('f_show',{n:words(n)});$('#fApply').disabled=!n}

/* =================== ТОВАР =================== */
var cur=null,curSize=null,gi=0;
function availHTML(it){var d='<span class="nw">'+dateOf(it)+'</span>';
  if(it.m==='st')return '<div class="row on st"><span class="dot"></span><div><div class="l1">'+t('av_st1')+'</div><div class="l2">'+t('av_st2',{d:d})+'</div></div></div>';
  return '<div class="row on or"><span class="dot"></span><div><div class="l1">'+t('av_or1',{n:lead(it)})+'</div><div class="l2">'+t('av_or2',{d:d,p:PREPAY_PCT})+'</div></div></div>'}
function initProduct(){
  cur=BY[+document.body.getAttribute('data-id')];if(!cur)return;
  var sz=sizesOf(cur);if(sz.length===1)curSize=sz[0];
  var g=$('#gal');
  g.addEventListener('scroll',function(){var j=Math.round(g.scrollLeft/Math.max(1,g.clientWidth));if(j!==gi){gi=j;$$('#gbars button').forEach(function(b,k){b.classList.toggle('on',k===j)})}},{passive:true});
  function go(j){var n=g.children.length;j=Math.max(0,Math.min(n-1,j));g.scrollTo({left:j*g.clientWidth,behavior:RM?'auto':'smooth'})}
  $('#gbars').addEventListener('click',function(e){var b=e.target.closest('button');if(b)go($$('#gbars button').indexOf(b))});
  if($('#gPrev')){$('#gPrev').addEventListener('click',function(){go(gi-1)});$('#gNext').addEventListener('click',function(){go(gi+1)})}
  $('#shSz').addEventListener('click',function(e){var b=e.target.closest('[data-sz]');if(!b)return;curSize=b.dataset.sz;$('#shSz').classList.remove('bad');$('#shEr').textContent='';$$('#shSz button').forEach(function(x){x.setAttribute('aria-pressed',x===b)})});
  $('#shAdd').addEventListener('click',addToCart);
  renderProduct();
}
function renderProduct(){var it=cur;
  $('#shT').textContent=cardTitle(it);$('#shPr').textContent=money(kop(it.p));
  $$('#shSz button').forEach(function(b){b.textContent=sizeLbl(b.dataset.sz);b.setAttribute('aria-pressed',b.dataset.sz===curSize)});
  if($('#shEr').textContent)$('#shEr').textContent=t('pick_size');
  $('#shAv').innerHTML=availHTML(it);
  $('#shAdd').textContent=t('add')+' · '+money(kop(it.p));
  var c=catOf(it),cr=$$('.crumbs > *');if(cr.length)cr[cr.length-1].textContent=cardTitle(it);
  var sim=ITEMS.filter(function(y){return catOf(y)===c&&y.id!==it.id}).sort(function(a,b){return Math.abs(a.p-it.p)-Math.abs(b.p-it.p)||b.id-a.id}).slice(0,10);
  $('#simR').innerHTML=sim.map(cardHTML).join('');watch($$('#simR .card'));
  $('.sim').hidden=!sim.length;
}
function flyToCart(){
  var src=$('#gal').children[gi];src=src&&src.querySelector('img');var dst=$('#cartBtn svg');
  if(RM||!src||!dst||!src.animate)return bump();
  var a=src.getBoundingClientRect(),b=dst.getBoundingClientRect(),s=Math.min(a.width,a.height,260);
  var f=document.createElement('img');f.src=src.currentSrc||src.src;f.className='fly';
  f.style.cssText='left:'+(a.left+a.width/2-s/2)+'px;top:'+(a.top+a.height/2-s/2)+'px;width:'+s+'px;height:'+s+'px';
  document.body.appendChild(f);
  var dx=b.left+b.width/2-(a.left+a.width/2),dy=b.top+b.height/2-(a.top+a.height/2);
  var an=f.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:'translate('+dx*.55+'px,'+(dy*.55-60)+'px) scale(.45)',opacity:1,offset:.6},{transform:'translate('+dx+'px,'+dy+'px) scale(.08)',opacity:.3}],{duration:720,easing:'cubic-bezier(.5,0,.3,1)'});
  an.onfinish=function(){f.remove();bump()}}
var adT;
function addToCart(){
  if(!curSize){$('#shSz').classList.add('bad');$('#shEr').textContent=t('pick_size');$('#shSz').scrollIntoView({block:'center',behavior:RM?'auto':'smooth'});return}
  loadCart();
  var c=cart.filter(function(c){return c.id===cur.id&&c.size===curSize})[0];
  if(c)c.q=Math.min(9,c.q+1);else cart.push({id:cur.id,size:curSize,q:1});
  save();flyToCart();renderCartBtn();
  var it=cur,s=curSize;
  setTimeout(function(){$('#adImg').src=tImg(it);$('#adN').textContent=cardTitle(it)+' · '+sizeLbl(s);
    $('#added').classList.add('on');clearTimeout(adT);adT=setTimeout(function(){$('#added').classList.remove('on')},4200)},RM?0:380)}

/* =================== КОРЗИНА =================== */
function metaLine(c){var it=BY[c.id];return '<b>'+esc(sizeLbl(c.size))+'</b> · <span class="'+(it.m==='st'?'st':'or')+'">'+t(it.m==='st'?'ci_stock':'ci_order',{d:'<span class="nw">'+dateOf(it)+'</span>'})+'</span>'}
function lineKop(c){return kop(BY[c.id].p)*c.q}
function renderCart(){
  var L=$('#drL');
  $('#drN').textContent=cart.length?words(cnt()):'';
  if(!cart.length){L.innerHTML='<div class="empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6.5a3 3 0 016 0V8"/></svg><div>'+t('empty')+'</div><a class="btn" href="'+R+'catalog/">'+t('to_cat')+'</a></div>';$('#drF').hidden=true;document.body.classList.add('cart-empty');return}
  $('#drF').hidden=false;document.body.classList.remove('cart-empty');
  L.innerHTML=cart.map(function(c,i){var it=BY[c.id];
    return '<div class="ci"><a class="ph" href="'+pHref(it)+'"><img src="'+tImg(it)+'" alt="" width="480" height="480"></a><div style="min-width:0"><a class="n" href="'+pHref(it)+'">'+esc(cardTitle(it))+'</a><div class="m">'+metaLine(c)+'</div>'
     +'<div class="r"><div class="qty"><button type="button" data-q="'+i+'" data-d="-1" aria-label="'+t('q_minus')+'"'+(c.q<2?' disabled':'')+'>−</button><span>'+c.q+'</span><button type="button" data-q="'+i+'" data-d="1" aria-label="'+t('q_plus')+'"'+(c.q>8?' disabled':'')+'>+</button></div><span class="pp">'+money(lineKop(c))+'</span></div>'
     +'<button class="rm" type="button" data-rm="'+i+'">'+t('remove')+'</button></div></div>'}).join('');
  var tot=cart.reduce(function(a,c){return a+lineKop(c)},0);
  $('#cGoods').textContent=words(cnt());$('#drTot').textContent=money(tot);
}
function initCart(){
  $('#drL').addEventListener('click',function(e){
    var rm=e.target.closest('[data-rm]');if(rm){cart.splice(+rm.dataset.rm,1);save();renderCartBtn();renderCart();return}
    var q=e.target.closest('[data-q]');if(q){var c=cart[+q.dataset.q];if(c){c.q=Math.max(1,Math.min(9,c.q+(+q.dataset.d)));save();renderCartBtn();renderCart()}}});
  renderCart();
}

/* ---------- старт ---------- */
function rerender(){applyStatic();renderCartBtn();
  if(PAGE_KIND==='section'&&SEC){renderSec();if($('#fsh').classList.contains('on'))renderF()}
  if(PAGE_KIND==='product'&&cur)renderProduct();
  if(PAGE_KIND==='cart')renderCart();
  if($('#srch').classList.contains('on'))renderSearch();
  document.title=document.title}
if(PAGE_KIND==='section')initSection();
if(PAGE_KIND==='product')initProduct();
if(PAGE_KIND==='cart')initCart();
rerender();
requestAnimationFrame(function(){document.documentElement.classList.add('ready')});
window.__sc={get cart(){return cart},ITEMS:ITEMS};
})();
