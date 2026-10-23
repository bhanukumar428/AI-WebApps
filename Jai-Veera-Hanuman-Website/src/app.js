const express = require("express");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const ExcelJS = require("exceljs");

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "..", "public");
const dataDir = process.env.DATA_DIR || path.join(__dirname, "..", "data");
const dataFile = path.join(dataDir, "store.json");
const sessionSecret = process.env.SESSION_SECRET || (process.env.NODE_ENV === "production" ? "" : "local-development-only-change-me");
const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "";

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet({
  contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"], imgSrc: ["'self'", "data:"], connectSrc: ["'self'"],
    objectSrc: ["'none'"], frameAncestors: ["'self'"], upgradeInsecureRequests: null
  }}
}));
app.use(express.json({limit:"8mb"}));

const seedProducts = [{"id": "1", "name": "Single-layer cashew kernels", "category": "cashew", "image": "/assets/products/single_layer_cashews.jpg", "alt": "Single-layer cashew kernels", "tag": "CORE CASHEWS", "description": "Whole kernels for everyday, retail or business enquiries.", "stockStatus": "unknown", "availableQuantity": 0, "quantityUnit": "kg", "lowStockThreshold": 5, "wholesalePricePerTin": null, "tinWeightKg": 20, "retailPricePerKg": null, "isActive": true, "updatedAt": null}, {"id": "2", "name": "Round cashews", "category": "cashew", "image": "/assets/products/round_cashews.jpg", "alt": "Round cashews", "tag": "CASHEW KERNELS", "description": "Ask about round-kernel grades, sizing and packaging.", "stockStatus": "unknown", "availableQuantity": 0, "quantityUnit": "kg", "lowStockThreshold": 5, "wholesalePricePerTin": null, "tinWeightKg": 20, "retailPricePerKg": null, "isActive": true, "updatedAt": null}, {"id": "3", "name": "Cashew splits & broken pieces", "category": "cashew", "image": "/assets/products/cashew single layer and broken.jpg", "alt": "Cashew splits and broken pieces", "tag": "SPLITS & BROKEN", "description": "For cooking, confectionery and food-service enquiries.", "stockStatus": "unknown", "availableQuantity": 0, "quantityUnit": "kg", "lowStockThreshold": 5, "wholesalePricePerTin": null, "tinWeightKg": 20, "retailPricePerKg": null, "isActive": true, "updatedAt": null}, {"id": "4", "name": "Peri-peri cashews", "category": "flavoured", "image": "/assets/products/peri_peri_cashews.jpg", "alt": "Peri-peri cashews", "tag": "FLAVOURED", "description": "Spicy peri-peri flavour; please confirm current availability.", "stockStatus": "unknown", "availableQuantity": 0, "quantityUnit": "kg", "lowStockThreshold": 5, "wholesalePricePerTin": null, "tinWeightKg": 20, "retailPricePerKg": null, "isActive": true, "updatedAt": null}, {"id": "5", "name": "BBQ cashews", "category": "flavoured", "image": "/assets/products/bbq_cashews.jpg", "alt": "BBQ cashews", "tag": "FLAVOURED", "description": "Smoky BBQ-style flavour; please confirm current availability.", "stockStatus": "unknown", "availableQuantity": 0, "quantityUnit": "kg", "lowStockThreshold": 5, "wholesalePricePerTin": null, "tinWeightKg": 20, "retailPricePerKg": null, "isActive": true, "updatedAt": null}, {"id": "6", "name": "Mint cashews", "category": "flavoured", "image": "/assets/products/mint_cashews.jpg", "alt": "Mint cashews", "tag": "FLAVOURED", "description": "Mint-seasoned cashew option; please confirm availability.", "stockStatus": "unknown", "availableQuantity": 0, "quantityUnit": "kg", "lowStockThreshold": 5, "wholesalePricePerTin": null, "tinWeightKg": 20, "retailPricePerKg": null, "isActive": true, "updatedAt": null}, {"id": "7", "name": "Masala cashews", "category": "flavoured", "image": "/assets/products/gibbiglover_masala_cashews.jpg", "alt": "Masala cashews", "tag": "FLAVOURED", "description": "Masala-seasoned cashews for flavour enquiries.", "stockStatus": "unknown", "availableQuantity": 0, "quantityUnit": "kg", "lowStockThreshold": 5, "wholesalePricePerTin": null, "tinWeightKg": 20, "retailPricePerKg": null, "isActive": true, "updatedAt": null}, {"id": "8", "name": "Almonds", "category": "dry-fruits", "image": "/assets/products/almonds.jpg", "alt": "Almonds", "tag": "DRY FRUITS", "description": "Enquire about sourcing, packing and order quantities.", "stockStatus": "unknown", "availableQuantity": 0, "quantityUnit": "kg", "lowStockThreshold": 5, "wholesalePricePerTin": null, "tinWeightKg": 20, "retailPricePerKg": null, "isActive": true, "updatedAt": null}, {"id": "9", "name": "Pistachios", "category": "dry-fruits", "image": "/assets/products/pistachios.jpg", "alt": "Pistachios", "tag": "DRY FRUITS", "description": "Ask about available sizes, packaging and quantities.", "stockStatus": "unknown", "availableQuantity": 0, "quantityUnit": "kg", "lowStockThreshold": 5, "wholesalePricePerTin": null, "tinWeightKg": 20, "retailPricePerKg": null, "isActive": true, "updatedAt": null}, {"id": "10", "name": "Walnuts", "category": "dry-fruits", "image": "/assets/products/walnuts.jpg", "alt": "Walnuts", "tag": "DRY FRUITS", "description": "For retail and wholesale availability enquiries.", "stockStatus": "unknown", "availableQuantity": 0, "quantityUnit": "kg", "lowStockThreshold": 5, "wholesalePricePerTin": null, "tinWeightKg": 20, "retailPricePerKg": null, "isActive": true, "updatedAt": null}, {"id": "11", "name": "Dried figs", "category": "dry-fruits", "image": "/assets/products/dry_figs.jpg", "alt": "Dried figs", "tag": "DRY FRUITS", "description": "Ask about pack sizes and current availability.", "stockStatus": "unknown", "availableQuantity": 0, "quantityUnit": "kg", "lowStockThreshold": 5, "wholesalePricePerTin": null, "tinWeightKg": 20, "retailPricePerKg": null, "isActive": true, "updatedAt": null}, {"id": "12", "name": "Golden raisins / dry grapes", "category": "dry-fruits", "image": "/assets/products/golden_raisins_dry_grapes.jpg", "alt": "Golden raisins / dry grapes", "tag": "DRY FRUITS", "description": "Enquire about raisins, packaging and bulk quantities.", "stockStatus": "unknown", "availableQuantity": 0, "quantityUnit": "kg", "lowStockThreshold": 5, "wholesalePricePerTin": null, "tinWeightKg": 20, "retailPricePerKg": null, "isActive": true, "updatedAt": null}, {"id": "13", "name": "Mixed dry fruits & nuts", "category": "dry-fruits", "image": "/assets/products/mixed_dry_fruits.jpg", "alt": "Mixed dry fruits and nuts", "tag": "MIXED RANGE", "description": "A mixed assortment; contents and pack options to confirm.", "stockStatus": "unknown", "availableQuantity": 0, "quantityUnit": "kg", "lowStockThreshold": 5, "wholesalePricePerTin": null, "tinWeightKg": 20, "retailPricePerKg": null, "isActive": true, "updatedAt": null}, {"id": "14", "name": "Pumpkin seeds", "category": "seeds", "image": "/assets/products/pumpkin seeds.jpg", "alt": "Pumpkin seeds", "tag": "SEEDS", "description": "Seed product enquiry; ask about current stock and packs.", "stockStatus": "unknown", "availableQuantity": 0, "quantityUnit": "kg", "lowStockThreshold": 5, "wholesalePricePerTin": null, "tinWeightKg": 20, "retailPricePerKg": null, "isActive": true, "updatedAt": null}, {"id": "15", "name": "Sunflower seeds", "category": "seeds", "image": "/assets/products/sunflower seeds.jpg", "alt": "Sunflower seeds", "tag": "SEEDS", "description": "Seed product enquiry; ask about current stock and packs.", "stockStatus": "unknown", "availableQuantity": 0, "quantityUnit": "kg", "lowStockThreshold": 5, "wholesalePricePerTin": null, "tinWeightKg": 20, "retailPricePerKg": null, "isActive": true, "updatedAt": null}, {"id": "16", "name": "Flax seeds", "category": "seeds", "image": "/assets/products/flax seeds.jpg", "alt": "Flax seeds", "tag": "SEEDS", "description": "Seed product enquiry; ask about current stock and packs.", "stockStatus": "unknown", "availableQuantity": 0, "quantityUnit": "kg", "lowStockThreshold": 5, "wholesalePricePerTin": null, "tinWeightKg": 20, "retailPricePerKg": null, "isActive": true, "updatedAt": null}];
function ensureStore() {
  fs.mkdirSync(dataDir, {recursive:true});
  if (!fs.existsSync(dataFile)) {
    const initial = {products:seedProducts.map(p=>({...p})), visits:[], enquiries:[]};
    fs.writeFileSync(dataFile, JSON.stringify(initial,null,2), {mode:0o600});
  }
}
function readStore() { ensureStore(); const data=JSON.parse(fs.readFileSync(dataFile,"utf8")); if(!Array.isArray(data.products)) data.products=[]; if(!Array.isArray(data.visits)) data.visits=[]; if(!Array.isArray(data.enquiries)) data.enquiries=[]; if(!data.shippingSettings) data.shippingSettings={shippingEnabled:false,shippingCharge:0,deliveryEnabled:false,deliveryCharge:0,freeShippingEnabled:false,freeShippingThreshold:1000}; if(!data.taxSettings)data.taxSettings={enabled:false,rate:0,mode:"exclusive",label:"GST"}; if(!data.discountSettings)data.discountSettings={enabled:false,type:"percentage",value:0,minOrder:0,maxDiscount:0,startsAt:"",endsAt:"",retail:true,wholesale:true}; if(!Array.isArray(data.offers))data.offers=[];
  if(!data.businessSettings)data.businessSettings={businessName:"JAI VEERA HANUMAN CASHEW PROCESSOR TRADING & CO",whatsappNumber:String(process.env.WHATSAPP_BUSINESS_NUMBER||"918553430387").replace(/[^0-9]/g,""),contactNumber:"+91 85534 30387",email:"",address:"AR No. 32/32, Ground Floor, M.G. Road, opposite Ganesha Temple, Srinivaspur, Kolar, Karnataka – 563135",openingHours:"",description:"Jai Veera Hanuman Cashew Processor Trading & Co connects with customers and business partners for cashew processing, consulting, trading and agent enquiries.",generalEnquiryMessage:"Hello Jai Veera Hanuman, I would like to enquire.",productEnquiryMessage:"Hello Jai Veera Hanuman, I would like to enquire about {product}.",orderEnquiryMessage:"Hello Jai Veera Hanuman, I would like to discuss my order {reference}."};
  return data; }
function writeStore(data) {
  ensureStore();
  const temp = dataFile + "." + crypto.randomBytes(5).toString("hex") + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(data,null,2), {mode:0o600});
  fs.renameSync(temp,dataFile);
}
function safeEqual(a,b) {
  const aa=Buffer.from(String(a)); const bb=Buffer.from(String(b));
  return aa.length===bb.length && crypto.timingSafeEqual(aa,bb);
}
function sign(value) { return crypto.createHmac("sha256",sessionSecret).update(value).digest("base64url"); }
function makeCookie(value, maxAge) {
  return `jvh_admin=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${process.env.NODE_ENV==="production" ? "; Secure" : ""}`;
}
function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie||"").split(";").map(x=>x.trim()).filter(Boolean).map(x=>{
    const i=x.indexOf("="); return [x.slice(0,i),decodeURIComponent(x.slice(i+1))];
  }));
}
function isAdmin(req) {
  if (!sessionSecret) return false;
  const raw=parseCookies(req).jvh_admin;
  if (!raw) return false;
  const parts=raw.split(".");
  if (parts.length!==2 || !safeEqual(sign(parts[0]),parts[1])) return false;
  try { const s=JSON.parse(Buffer.from(parts[0],"base64url").toString()); const account=currentAdminAccount(); return s.u===(account?.username||adminUsername) && s.v===(account?.sessionVersion||1) && s.exp>Date.now(); } catch { return false; }
}
function requireAdmin(req,res,next) { if (!isAdmin(req)) return res.status(401).json({error:"Please sign in again."}); next(); }
const loginAttempts=new Map();
function publicProduct(p) { const legacyWeight=Number(p.retailPackWeightKg||1); const retailPacks=Array.isArray(p.retailPacks)&&p.retailPacks.length?p.retailPacks:[{id:"legacy-"+p.id,label:`${legacyWeight} kg pack`,weightKg:legacyWeight,price:p.retailPricePerPack??p.retailPricePerKg??null,enabled:true}]; const wholesaleOptions=Array.isArray(p.wholesaleOptions)&&p.wholesaleOptions.length?p.wholesaleOptions:[{id:"tin-"+p.id,label:`${Number(p.tinWeightKg||20)} kg tin`,weightKg:Number(p.tinWeightKg||20),price:p.wholesalePricePerTin??null,enabled:true}]; return {...p,retailPacks,wholesaleOptions,retailDisplayMode:["all","starting","default"].includes(p.retailDisplayMode)?p.retailDisplayMode:"all",defaultRetailPackId:p.defaultRetailPackId||retailPacks.find(x=>x&&x.enabled!==false)?.id||null,showWholesalePrice:p.showWholesalePrice!==false,retailPackWeightKg:legacyWeight,retailPricePerPack:p.retailPricePerPack ?? p.retailPricePerKg ?? null,updatedAt:p.updatedAt||null}; }
function normalizeTaxSettings(input={}) { const rate=Number(input.rate??0); if(!Number.isFinite(rate)||rate<0||rate>100)throw new Error("GST rate must be between 0 and 100."); return {enabled:input.enabled===true,rate:Number(rate.toFixed(2)),mode:input.mode==="inclusive"?"inclusive":"exclusive",label:cleanText(input.label||"GST",30)||"GST"}; }
function normalizeDiscountSettings(input={}) { const value=Number(input.value??0),minOrder=Number(input.minOrder??0),maxDiscount=Number(input.maxDiscount??0); if(![value,minOrder,maxDiscount].every(n=>Number.isFinite(n)&&n>=0)||value>10000000)throw new Error("Discount amounts must be valid non-negative numbers."); const type=input.type==="fixed"?"fixed":"percentage";if(type==="percentage"&&value>100)throw new Error("Percentage discount must not exceed 100%."); return {enabled:input.enabled===true,type,value,minOrder,maxDiscount,startsAt:cleanText(input.startsAt,30),endsAt:cleanText(input.endsAt,30),retail:input.retail!==false,wholesale:input.wholesale!==false}; }
function activeDateRange(startsAt,endsAt){const now=Date.now(),start=startsAt?Date.parse(startsAt):NaN,end=endsAt?Date.parse(endsAt):NaN;return (!startsAt||(!Number.isNaN(start)&&now>=start))&&(!endsAt||(!Number.isNaN(end)&&now<=end));}
function pricingForItems(rawItems,store){const items=[];let subtotal=0;for(const raw of rawItems){const id=String(raw.productId||raw.id||"");const product=store.products.find(p=>p.id===id&&p.isActive);const qty=Number(raw.quantity);if(!product)throw Object.assign(new Error("A selected product is no longer available. Refresh the catalogue."),{status:400});if(!Number.isInteger(qty)||qty<1||qty>10000)throw Object.assign(new Error(`Enter a valid quantity for ${product.name}.`),{status:400});const type=raw.variantType==="wholesale"?"wholesale":"retail";const pub=publicProduct(product);const options=(type==="wholesale"?pub.wholesaleOptions:pub.retailPacks).filter(x=>x&&x.enabled!==false);let variant=options.find(x=>String(x.id)===String(raw.variantId));if(!variant&&options.length===1)variant=options[0];if(!variant)throw Object.assign(new Error(`Choose a valid ${type} pack for ${product.name}.`),{status:400});const price=Number(variant.price),weight=Number(variant.weightKg||1);if(product.stockStatus!=="In Stock"||!Number.isFinite(price)||price<=0)throw Object.assign(new Error(`${product.name} is not available for ${type} checkout or has no price configured.`),{status:409});const requiredKg=qty*weight;const required=product.quantityUnit==="kg"?requiredKg:qty;if(Number(product.availableQuantity)<required)throw Object.assign(new Error(`Insufficient stock for ${product.name}.`),{status:409});const line=Number((price*qty).toFixed(2));subtotal=Number((subtotal+line).toFixed(2));items.push({productId:product.id,name:product.name,category:product.category||"",image:product.image,variantType:type,variantId:String(variant.id),variantLabel:variant.label||`${weight} kg ${type==="wholesale"?"tin":"pack"}`,weightKg:weight,quantity:qty,unitPrice:price,subtotal:line});}return {items,subtotal};}
function calculatePricing(subtotal,items,store){const tax=normalizeTaxSettings(store.taxSettings),discount=normalizeDiscountSettings(store.discountSettings);let automaticDiscount=0,offerDiscount=0;const modes=new Set(items.map(i=>i.variantType));const discountAllowed=discount.enabled&&activeDateRange(discount.startsAt,discount.endsAt)&&[...modes].every(m=>m==="retail"?discount.retail:discount.wholesale)&&subtotal>=discount.minOrder;if(discountAllowed){automaticDiscount=discount.type==="fixed"?discount.value:subtotal*discount.value/100;if(discount.maxDiscount>0)automaticDiscount=Math.min(automaticDiscount,discount.maxDiscount);automaticDiscount=Math.min(subtotal,Number(automaticDiscount.toFixed(2)));}for(const item of items){const applicable=(store.offers||[]).filter(o=>o&&o.active!==false&&activeDateRange(o.startsAt,o.endsAt)&&(o.customerType==="all"||o.customerType===item.variantType)&&(!Array.isArray(o.productIds)||!o.productIds.length||o.productIds.includes(item.productId)));let best=0;for(const offer of applicable){const raw=offer.discountType==="fixed"?Number(offer.discountValue||0):item.subtotal*Number(offer.discountValue||0)/100;best=Math.max(best,Math.min(item.subtotal,Number.isFinite(raw)?raw:0));}offerDiscount+=best;}offerDiscount=Number(Math.min(subtotal,offerDiscount).toFixed(2));const discountAmount=Number(Math.min(subtotal,automaticDiscount+offerDiscount).toFixed(2));const taxable=Math.max(0,subtotal-discountAmount);const taxAmount=tax.enabled?(tax.mode==="inclusive"?Number((taxable*tax.rate/(100+tax.rate||100)).toFixed(2)):Number((taxable*tax.rate/100).toFixed(2))):0;const taxIncluded=tax.enabled&&tax.mode==="inclusive";const taxToAdd=taxIncluded?0:taxAmount;const charges=calculateCharges(taxable+taxToAdd,normalizeShippingSettings(store.shippingSettings));return {discountAmount,automaticDiscount:Number(automaticDiscount.toFixed(2)),offerDiscountAmount:offerDiscount,taxAmount,taxLabel:tax.label,taxRate:tax.rate,taxMode:tax.mode,subtotal,shippingCharge:charges.shippingCharge,deliveryCharge:charges.deliveryCharge,freeShippingApplied:charges.freeShippingApplied,estimatedTotal:Number((taxable+taxToAdd+charges.shippingCharge+charges.deliveryCharge).toFixed(2))};}

app.get("/api/health", (_req,res)=>res.json({status:"ok",app:"Jai Veera Hanuman Cashew Processor Trading & Co"}));
app.get("/api/config", (_req,res)=>{const store=readStore();res.set("Cache-Control","no-store");res.json(publicBusinessSettings(store));});
app.get("/contact/whatsapp",(req,res)=>{const store=readStore(),settings=normalizeBusinessSettings(store.businessSettings||{});const template=String(req.query.template||"general");let message=settings.generalEnquiryMessage;if(template==="product"){const product=cleanText(req.query.product,180);message=settings.productEnquiryMessage.replace(/\{product\}/g,product||"a product");}else if(template==="order"){const reference=cleanText(req.query.reference,100);message=settings.orderEnquiryMessage.replace(/\{reference\}/g,reference||"my order");}res.redirect(302,"https://wa.me/"+settings.whatsappNumber+"?text="+encodeURIComponent(message));});
app.get("/api/admin/business-settings",requireAdmin,(_req,res)=>{const store=readStore();res.set("Cache-Control","no-store");res.json(normalizeBusinessSettings(store.businessSettings||{}));});
app.put("/api/admin/business-settings",requireAdmin,(req,res)=>{try{const store=readStore();store.businessSettings=normalizeBusinessSettings(req.body||{},store.businessSettings||{});writeStore(store);res.set("Cache-Control","no-store");res.json({ok:true,settings:store.businessSettings});}catch(e){res.status(400).json({error:e.message||"Invalid business settings."});}});
function normalizeShippingSettings(input={}) {
  const amount=(v,label)=>{const n=Number(v);if(!Number.isFinite(n)||n<0||n>10000000)throw new Error(`${label} must be a valid non-negative amount.`);return Number(n.toFixed(2));};
  return {shippingEnabled:input.shippingEnabled===true,shippingCharge:amount(input.shippingCharge??0,"Shipping charge"),deliveryEnabled:input.deliveryEnabled===true,deliveryCharge:amount(input.deliveryCharge??0,"Delivery charge"),freeShippingEnabled:input.freeShippingEnabled===true,freeShippingThreshold:amount(input.freeShippingThreshold??1000,"Free-shipping threshold")};
}
function calculateCharges(subtotal, settings) {
  const freeShipping=settings.shippingEnabled && settings.freeShippingEnabled && subtotal>=settings.freeShippingThreshold;
  const shippingCharge=settings.shippingEnabled&&!freeShipping?settings.shippingCharge:0;
  const deliveryCharge=settings.deliveryEnabled?settings.deliveryCharge:0;
  return {shippingCharge:Number(shippingCharge.toFixed(2)),deliveryCharge:Number(deliveryCharge.toFixed(2)),freeShippingApplied:!!freeShipping,estimatedTotal:Number((subtotal+shippingCharge+deliveryCharge).toFixed(2))};
}
app.get("/api/shipping-settings",(_req,res)=>{const store=readStore();const settings=normalizeShippingSettings(store.shippingSettings);res.set("Cache-Control","no-store");res.json({...settings});});
app.get("/api/admin/shipping-settings",requireAdmin,(_req,res)=>{res.set("Cache-Control","no-store");res.json(normalizeShippingSettings(readStore().shippingSettings));});
app.put("/api/admin/shipping-settings",requireAdmin,(req,res)=>{try{const store=readStore();store.shippingSettings=normalizeShippingSettings(req.body||{});writeStore(store);res.json({ok:true,settings:store.shippingSettings});}catch(e){res.status(400).json({error:e.message||"Invalid shipping settings."});}});
app.get("/api/pricing-settings",(_req,res)=>{const s=readStore();res.set("Cache-Control","no-store");res.json({taxSettings:normalizeTaxSettings(s.taxSettings),discountSettings:normalizeDiscountSettings(s.discountSettings),offers:s.offers.filter(o=>o&&o.active!==false&&activeDateRange(o.startsAt,o.endsAt))});});
app.get("/api/admin/pricing-settings",requireAdmin,(_req,res)=>{const s=readStore();res.set("Cache-Control","no-store");res.json({taxSettings:normalizeTaxSettings(s.taxSettings),discountSettings:normalizeDiscountSettings(s.discountSettings),offers:s.offers});});
app.put("/api/admin/pricing-settings",requireAdmin,(req,res)=>{try{const s=readStore(),b=req.body||{};s.taxSettings=normalizeTaxSettings(b.taxSettings||{});s.discountSettings=normalizeDiscountSettings(b.discountSettings||{});writeStore(s);res.json({ok:true,taxSettings:s.taxSettings,discountSettings:s.discountSettings});}catch(e){res.status(400).json({error:e.message});}});
app.put("/api/admin/offers",requireAdmin,(req,res)=>{const s=readStore(),list=Array.isArray(req.body?.offers)?req.body.offers:[];if(list.length>100)return res.status(400).json({error:"Maximum 100 offers allowed."});try{s.offers=list.map(o=>({id:cleanText(o.id||crypto.randomUUID(),80),title:cleanText(o.title,100),description:cleanText(o.description,300),active:o.active===true,startsAt:cleanText(o.startsAt,30),endsAt:cleanText(o.endsAt,30),discountType:o.discountType==="fixed"?"fixed":"percentage",discountValue:Math.max(0,Number(o.discountValue)||0),productIds:Array.isArray(o.productIds)?o.productIds.map(x=>String(x).slice(0,80)).slice(0,100):[],customerType:["retail","wholesale","all"].includes(o.customerType)?o.customerType:"all"}));if(s.offers.some(o=>!o.title))return res.status(400).json({error:"Every offer needs a title."});writeStore(s);res.json({ok:true,offers:s.offers});}catch(e){res.status(400).json({error:e.message});}});
app.post("/api/order-quote",(req,res)=>{try{const rawItems=Array.isArray(req.body?.items)?req.body.items:[];if(!rawItems.length||rawItems.length>40)return res.status(400).json({error:"Your cart is empty or contains too many items."});const store=readStore(),priced=pricingForItems(rawItems,store),pricing=calculatePricing(priced.subtotal,priced.items,store);res.set("Cache-Control","no-store");res.json({...pricing,items:priced.items});}catch(e){res.status(e.status||400).json({error:e.message||"Unable to calculate quote."});}});
app.get("/api/products", (_req,res)=> {
  const store=readStore();
  res.set("Cache-Control","no-store");
  res.json(store.products.filter(p=>p.isActive).map(publicProduct));
});
app.post("/api/analytics/visit",(req,res)=>{
  const store=readStore();
  const page=typeof req.body?.page==="string" ? req.body.page.slice(0,180) : "/";
  const day=new Date().toISOString().slice(0,10);
  store.visits.push({day,page,at:Date.now()});
  if(store.visits.length>100000) store.visits=store.visits.slice(-80000);
  writeStore(store); res.status(204).end();
});
app.post("/api/enquiries",(req,res)=>{
  const {name,phone,product,quantity,kind,message}=req.body||{};
  if (![name,phone,product].every(v=>typeof v==="string" && v.trim()) || name.length>100 || phone.length>40 || product.length>180 || (message||"").length>1000) return res.status(400).json({error:"Please check the required enquiry fields."});
  const store=readStore();
  store.enquiries.push({id:crypto.randomUUID(),name:name.trim(),phone:phone.trim(),product:product.trim(),quantity:String(quantity||"").slice(0,80),kind:kind==="Wholesale"?"Wholesale":"Retail",message:String(message||"").trim(),createdAt:new Date().toISOString(),status:"New Enquiry"});
  writeStore(store); res.status(201).json({ok:true,message:"Enquiry received."});
});

const orderStatuses=["New Enquiry","Contacted","Awaiting Payment","Payment Confirmed","Processing","Dispatched","Completed","Cancelled"];
const orderAttempts=new Map();
function cleanText(v,max=250){return typeof v==="string"?v.trim().slice(0,max):"";}
function normalizeBusinessSettings(input={}, previous={}) {
  const digits=String(input.whatsappNumber??previous.whatsappNumber??process.env.WHATSAPP_BUSINESS_NUMBER??"918553430387").replace(/[^0-9]/g,"");
  if(digits.length<10||digits.length>15)throw new Error("WhatsApp number must include country code and contain 10 to 15 digits.");
  const phone=String(input.contactNumber??previous.contactNumber??("+".concat(digits))).trim();
  if(phone && !/^\+?[0-9 ()-]{8,20}$/.test(phone))throw new Error("Enter a valid business contact number.");
  const email=cleanText(input.email??previous.email??"",160);
  if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error("Enter a valid business email address.");
  const address=cleanText(input.address??previous.address??"",300);
  const openingHours=cleanText(input.openingHours??previous.openingHours??"",160);
  const businessName=cleanText(input.businessName??previous.businessName??"JAI VEERA HANUMAN CASHEW PROCESSOR TRADING & CO",120)||"JAI VEERA HANUMAN CASHEW PROCESSOR TRADING & CO";
  const description=cleanText(input.description??previous.description??"",500);
  const generalEnquiryMessage=cleanText(input.generalEnquiryMessage??previous.generalEnquiryMessage??"Hello Jai Veera Hanuman, I would like to enquire.",500)||"Hello Jai Veera Hanuman, I would like to enquire.";
  const productEnquiryMessage=cleanText(input.productEnquiryMessage??previous.productEnquiryMessage??"Hello Jai Veera Hanuman, I would like to enquire about {product}.",500)||"Hello Jai Veera Hanuman, I would like to enquire about {product}.";
  const orderEnquiryMessage=cleanText(input.orderEnquiryMessage??previous.orderEnquiryMessage??"Hello Jai Veera Hanuman, I would like to discuss my order {reference}.",500)||"Hello Jai Veera Hanuman, I would like to discuss my order {reference}.";
  return {businessName,whatsappNumber:digits,contactNumber:phone,email,address,openingHours,description,generalEnquiryMessage,productEnquiryMessage,orderEnquiryMessage};
}
function publicBusinessSettings(store) {
  const b=normalizeBusinessSettings(store.businessSettings||{});
  return {businessName:b.businessName,whatsappBusinessNumber:b.whatsappNumber,phone:b.contactNumber,email:b.email,address:b.address,openingHours:b.openingHours,description:b.description,generalEnquiryMessage:b.generalEnquiryMessage,productEnquiryMessage:b.productEnquiryMessage,orderEnquiryMessage:b.orderEnquiryMessage,gstin:"29BLUPP0673A1ZT"};
}
app.post("/api/order-enquiries",(req,res)=>{
  const ip=req.ip||"unknown",now=Date.now(),recent=(orderAttempts.get(ip)||[]).filter(t=>now-t<10*60*1000);
  if(recent.length>=20)return res.status(429).json({error:"Too many checkout attempts. Please try again later."});
  recent.push(now);orderAttempts.set(ip,recent);
  const b=req.body||{},c=b.customer||{},rawItems=Array.isArray(b.items)?b.items:[];
  const name=cleanText(c.name,100),rawPhone=cleanText(c.phone,30),email=cleanText(c.email,160),address=cleanText(c.address,250),city=cleanText(c.city,100),stateName=cleanText(c.state,100),pin=cleanText(c.pin,6);
  let normalizedPhone=rawPhone.replace(/\D/g,"");if(normalizedPhone.length===12&&normalizedPhone.startsWith("91"))normalizedPhone=normalizedPhone.slice(2);if(normalizedPhone.length===11&&normalizedPhone.startsWith("0"))normalizedPhone=normalizedPhone.slice(1);
  if(!name||!/^([6-9][0-9]{9})$/.test(normalizedPhone)||!address||!city||!stateName||!/^\d{6}$/.test(pin))return res.status(400).json({error:"Enter a name, valid 10-digit Indian mobile number, full address, city, state and six-digit PIN code."});
  if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.status(400).json({error:"Enter a valid email address or leave it blank."});
  if(!rawItems.length||rawItems.length>40)return res.status(400).json({error:"Your cart is empty or contains too many items."});
  const key=cleanText(b.idempotencyKey,100);const store=readStore();
  if(key){const prior=store.enquiries.find(e=>e.idempotencyKey===key);if(prior)return res.status(200).json({ok:true,duplicate:true,enquiryId:prior.reference||prior.id,whatsappMessage:prior.whatsappMessage,whatsappBusinessNumber:normalizeBusinessSettings(store.businessSettings||{}).whatsappNumber});}
  let priced;try{priced=pricingForItems(rawItems,store);}catch(e){return res.status(e.status||400).json({error:e.message});}const items=priced.items,subtotal=priced.subtotal;const id=crypto.randomUUID();const ref="JVH-"+new Date().toISOString().slice(0,10).replace(/-/g,"")+"-"+id.slice(0,8).toUpperCase();
  const customer={name,phone:normalizedPhone,email,address,city,state:stateName,pin,company:cleanText(c.company,160),gstin:cleanText(c.gstin,30),instructions:cleanText(c.instructions,500)};
  const pricing=calculatePricing(subtotal,items,store),charges={shippingCharge:pricing.shippingCharge,deliveryCharge:pricing.deliveryCharge,freeShippingApplied:pricing.freeShippingApplied,estimatedTotal:pricing.estimatedTotal};
  const expected=b.expectedQuote&&typeof b.expectedQuote==="object"?b.expectedQuote:null;
  if(expected){const expectedItems=Array.isArray(expected.items)?expected.items:[];const actualItems=items.map(i=>({productId:i.productId,variantType:i.variantType,variantId:i.variantId,quantity:i.quantity,unitPrice:i.unitPrice}));const sameItems=JSON.stringify(expectedItems.map(i=>[String(i.productId),String(i.variantType||"retail"),String(i.variantId||""),Number(i.quantity),Number(i.unitPrice)]))===JSON.stringify(actualItems.map(i=>[String(i.productId),String(i.variantType),String(i.variantId),Number(i.quantity),Number(i.unitPrice)]));if(Number(expected.subtotal)!==subtotal||Number(expected.shippingCharge)!==charges.shippingCharge||Number(expected.deliveryCharge)!==charges.deliveryCharge||Number(expected.estimatedTotal)!==charges.estimatedTotal||Number(expected.discountAmount||0)!==pricing.discountAmount||Number(expected.taxAmount||0)!==pricing.taxAmount||Boolean(expected.freeShippingApplied)!==charges.freeShippingApplied||!sameItems)return res.status(409).json({error:"Product prices, tax, discount or shipping charges changed just before submission. Please review the updated total and confirm again."});}
  const lines=items.map((item,i)=>`${i+1}. ${item.name}${item.category?` (${item.category})`:""}\n   Type: ${item.variantType} · ${item.variantLabel} (${item.weightKg} kg each)\n   Quantity: ${item.quantity} × ${item.variantLabel}\n   Unit price: ₹${item.unitPrice.toLocaleString("en-IN")}\n   Subtotal: ₹${item.subtotal.toLocaleString("en-IN")}`).join("\n\n");
  const businessSettings=normalizeBusinessSettings(store.businessSettings||{});const orderIntro=businessSettings.orderEnquiryMessage.replace(/\{reference\}/g,ref);const whatsappMessage=`${businessSettings.businessName}\n\n${orderIntro}\nEnquiry Reference: ${ref}\n\nCUSTOMER DETAILS\nName: ${customer.name}\nMobile: ${customer.phone}\nEmail: ${customer.email||"Not provided"}${customer.company?`\nCompany: ${customer.company}`:""}${customer.gstin?`\nGSTIN: ${customer.gstin}`:""}\n\nDELIVERY ADDRESS\n${customer.address}\nCity: ${customer.city}\nState: ${customer.state}\nPIN Code: ${customer.pin}\n\nORDER ITEMS\n${lines}\n\nProduct Subtotal: ₹${subtotal.toLocaleString("en-IN")}\nDiscount: ₹${pricing.discountAmount.toLocaleString("en-IN")}\n${pricing.taxLabel} (${pricing.taxRate}% ${pricing.taxMode}): ₹${pricing.taxAmount.toLocaleString("en-IN")}\nShipping Charge: ${charges.freeShippingApplied?"₹0 (Free Shipping)":"₹"+charges.shippingCharge.toLocaleString("en-IN")}\nDelivery Charge: ₹${charges.deliveryCharge.toLocaleString("en-IN")}\nEstimated Total: ₹${charges.estimatedTotal.toLocaleString("en-IN")}\nAdditional Instructions: ${customer.instructions||"None"}\n\nPlease confirm availability, payment method and delivery schedule. This is an enquiry, not a confirmed order.`;
  const enquiry={id,reference:ref,type:"Cart Order",customer,items,subtotal,discountAmount:pricing.discountAmount,taxAmount:pricing.taxAmount,taxLabel:pricing.taxLabel,taxRate:pricing.taxRate,taxMode:pricing.taxMode,shippingCharge:charges.shippingCharge,deliveryCharge:charges.deliveryCharge,deliveryCharges:charges.shippingCharge+charges.deliveryCharge,freeShippingApplied:charges.freeShippingApplied,estimatedTotal:charges.estimatedTotal,status:"New Enquiry",statusHistory:[{status:"New Enquiry",at:new Date().toISOString(),by:"system"}],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),idempotencyKey:key||null,whatsappMessage};
  store.enquiries.push(enquiry);writeStore(store);
  res.status(201).json({ok:true,enquiryId:ref,subtotal,discountAmount:pricing.discountAmount,taxAmount:pricing.taxAmount,shippingCharge:charges.shippingCharge,deliveryCharge:charges.deliveryCharge,freeShippingApplied:charges.freeShippingApplied,estimatedTotal:charges.estimatedTotal,whatsappMessage,whatsappBusinessNumber:normalizeBusinessSettings(store.businessSettings||{}).whatsappNumber});
});
app.get("/api/admin/order-enquiries",requireAdmin,(_req,res)=>{
  const store=readStore();const orders=store.enquiries.filter(e=>e.type==="Cart Order"&&!e.archivedAt).map(e=>({...e,whatsappMessage:undefined,idempotencyKey:undefined})).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  res.set("Cache-Control","no-store");res.json(orders);
});
app.get("/api/admin/order-enquiries/:id",requireAdmin,(req,res)=>{
  const e=readStore().enquiries.find(x=>x.type==="Cart Order"&&(x.id===req.params.id||x.reference===req.params.id));if(!e)return res.status(404).json({error:"Order enquiry not found."});const out={...e};delete out.idempotencyKey;delete out.whatsappMessage;res.set("Cache-Control","no-store");res.json(out);
});
app.patch("/api/admin/order-enquiries/:id/status",requireAdmin,(req,res)=>{
  const status=cleanText(req.body?.status,40);if(!orderStatuses.includes(status))return res.status(400).json({error:"Choose a valid order status."});
  const store=readStore(),e=store.enquiries.find(x=>x.type==="Cart Order"&&(x.id===req.params.id||x.reference===req.params.id));if(!e)return res.status(404).json({error:"Order enquiry not found."});
  if(!Array.isArray(e.statusHistory))e.statusHistory=[];e.status=status;e.updatedAt=new Date().toISOString();e.statusHistory.push({status,at:e.updatedAt,by:adminUsername});writeStore(store);res.json({ok:true,status:e.status,updatedAt:e.updatedAt,statusHistory:e.statusHistory});
});

function credentialHash(password,salt){return crypto.pbkdf2Sync(String(password),salt,210000,32,"sha256").toString("hex");}
function currentAdminAccount(){const s=readStore();return s.adminAccount||null;}
function verifyAdminPassword(password){const account=currentAdminAccount();if(account)return safeEqual(credentialHash(password,account.salt),account.passwordHash);return !!adminPassword&&safeEqual(password,adminPassword);}
function verifyRecoveryDob(dob,account){if(!account?.dobSalt||!account?.dobHash)return false;const normalized=String(dob||"").trim();return safeEqual(credentialHash(normalized,account.dobSalt),account.dobHash);}
app.post("/api/admin/login",(req,res)=>{
  if(!sessionSecret || (!adminPassword&&!currentAdminAccount())) return res.status(503).json({error:"Admin login is not configured. Set ADMIN_PASSWORD and SESSION_SECRET in the app settings."});
  const ip=req.ip||"unknown"; const now=Date.now(); const recent=(loginAttempts.get(ip)||[]).filter(t=>now-t<15*60*1000);
  if(recent.length>=8) return res.status(429).json({error:"Too many attempts. Please try again in 15 minutes."});
  const {username,password}=req.body||{};
  const account=currentAdminAccount();const expectedUsername=account?.username||adminUsername;if(!safeEqual(username||"",expectedUsername) || !verifyAdminPassword(password||"")) {
    recent.push(now); loginAttempts.set(ip,recent); return res.status(401).json({error:"Invalid username or password."});
  }
  loginAttempts.delete(ip);
  if(!account&&adminPassword){const store=readStore(),salt=crypto.randomBytes(16).toString("hex");store.adminAccount={username:adminUsername,salt,passwordHash:credentialHash(adminPassword,salt),createdAt:new Date().toISOString()};writeStore(store);}const payload=Buffer.from(JSON.stringify({u:expectedUsername,v:currentAdminAccount()?.sessionVersion||1,exp:now+8*60*60*1000,nonce:crypto.randomBytes(16).toString("hex")})).toString("base64url");
  res.set("Set-Cookie",makeCookie(payload+"."+sign(payload),8*60*60));
  res.json({ok:true});
});
app.post("/api/admin/logout",(_req,res)=>{res.set("Set-Cookie",makeCookie("",0));res.json({ok:true});});
app.get("/api/admin/me",requireAdmin,(_req,res)=>res.json({username:currentAdminAccount()?.username||adminUsername}));
app.put("/api/admin/account",requireAdmin,(req,res)=>{const b=req.body||{},username=cleanText(b.username,80),currentPassword=String(b.currentPassword||""),newPassword=String(b.newPassword||""),dob=String(b.dob||"").trim();if(!username||!/^[A-Za-z0-9._-]{3,80}$/.test(username))return res.status(400).json({error:"Username must be 3–80 letters, numbers, dots, underscores or hyphens."});if(!verifyAdminPassword(currentPassword))return res.status(401).json({error:"Current password is incorrect."});if(newPassword&&newPassword.length<12)return res.status(400).json({error:"New password must contain at least 12 characters."});if(dob&&!/^\d{4}-\d{2}-\d{2}$/.test(dob))return res.status(400).json({error:"Choose a valid date of birth for recovery."});const s=readStore(),old=s.adminAccount||{},salt=crypto.randomBytes(16).toString("hex");s.adminAccount={...old,username,salt: newPassword? salt:(old.salt||salt),passwordHash:newPassword?credentialHash(newPassword,salt):(old.passwordHash||credentialHash(adminPassword,salt)),updatedAt:new Date().toISOString(),sessionVersion:(old.sessionVersion||1)+1};if(dob){const ds=crypto.randomBytes(16).toString("hex");s.adminAccount.dobSalt=ds;s.adminAccount.dobHash=credentialHash(dob,ds);}writeStore(s);res.set("Set-Cookie",makeCookie("",0));res.json({ok:true,message:"Account saved. Please sign in again with the updated credentials."});});
const recoveryAttempts=new Map();
app.post("/api/admin/recover",(req,res)=>{const ip=req.ip||"unknown",now=Date.now(),recent=(recoveryAttempts.get(ip)||[]).filter(t=>now-t<15*60*1000);if(recent.length>=5)return res.status(429).json({error:"Too many recovery attempts. Try again in 15 minutes."});recent.push(now);recoveryAttempts.set(ip,recent);const b=req.body||{},username=cleanText(b.username,80),dob=String(b.dob||"").trim(),newPassword=String(b.newPassword||"");const s=readStore(),account=s.adminAccount;if(!account||!safeEqual(username,account.username)||!verifyRecoveryDob(dob,account))return res.status(401).json({error:"Recovery details could not be verified."});if(newPassword.length<12)return res.status(400).json({error:"New password must contain at least 12 characters."});const salt=crypto.randomBytes(16).toString("hex");account.salt=salt;account.passwordHash=credentialHash(newPassword,salt);account.updatedAt=new Date().toISOString();account.sessionVersion=(account.sessionVersion||1)+1;writeStore(s);res.set("Set-Cookie",makeCookie("",0));res.json({ok:true,message:"Password reset. Return to sign in."});});

function saveProductImage(imageData) {
  if (!imageData) return null;
  if (typeof imageData !== "string" || imageData.length > 7 * 1024 * 1024) throw new Error("Image must be 5 MB or smaller.");
  const match = imageData.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error("Upload a valid JPG, PNG, or WebP image.");
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) throw new Error("Image must be 5 MB or smaller.");
  const type = match[1];
  const valid = type === "jpeg" ? buffer.subarray(0,3).equals(Buffer.from([0xff,0xd8,0xff]))
    : type === "png" ? buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    : buffer.toString("RIFF",0,4)==="RIFF" && buffer.toString("WEBP",8,12)==="WEBP";
  if (!valid) throw new Error("The image contents do not match the selected image type.");
  const dir = path.join(publicDir, "uploads", "products");
  fs.mkdirSync(dir, {recursive:true});
  const filename = `${crypto.randomUUID()}.${type === "jpeg" ? "jpg" : type}`;
  fs.writeFileSync(path.join(dir, filename), buffer, {flag:"wx"});
  return `/uploads/products/${filename}`;
}
app.post("/api/admin/products",requireAdmin,(req,res)=>{
  try {
    const b=req.body||{}, store=readStore(), name=cleanText(b.name,160);
    if(!name) return res.status(400).json({error:"Product name is required."});
    const category=cleanText(b.category,80)||"cashew";
    const quantity=Number(b.availableQuantity??0), threshold=Number(b.lowStockThreshold??5), tin=Number(b.tinWeightKg??20), retailWeight=Number(b.retailPackWeightKg??1);
    const wholesale=b.wholesalePricePerTin===""||b.wholesalePricePerTin==null?null:Number(b.wholesalePricePerTin);
    const retail=b.retailPricePerPack===""||b.retailPricePerPack==null?null:Number(b.retailPricePerPack);
    if(!Number.isFinite(quantity)||quantity<0||!Number.isFinite(threshold)||threshold<0||!Number.isFinite(tin)||tin<=0||!Number.isFinite(retailWeight)||retailWeight<=0) return res.status(400).json({error:"Enter valid non-negative quantity/threshold and positive pack weights."});
    if((wholesale!==null&&(!Number.isFinite(wholesale)||wholesale<0))||(retail!==null&&(!Number.isFinite(retail)||retail<0))) return res.status(400).json({error:"Prices must be non-negative or left blank."});
    const id=crypto.randomUUID(), image=saveProductImage(b.imageData)||"/assets/vhcp-logo.jpeg";
    const parseOptions=value=>Array.isArray(value)?value.map((o,i)=>({id:cleanText(o.id,80)||`${id}-${i+1}`,label:cleanText(o.label,80)||`${Number(o.weightKg)||1} kg pack`,weightKg:Number(o.weightKg),price:o.price===""||o.price==null?null:Number(o.price),enabled:o.enabled!==false})).filter(o=>o.weightKg>0&&Number.isFinite(o.weightKg)&&(o.price===null||(Number.isFinite(o.price)&&o.price>=0))):[];
    const retailPacks=parseOptions(b.retailPacks), wholesaleOptions=parseOptions(b.wholesaleOptions);
    const product={id,name,category,image,alt:name,tag:category.toUpperCase(),description:cleanText(b.description,500),stockStatus:quantity===0?"Out of Stock":quantity<threshold?"Low Stock":"In Stock",availableQuantity:quantity,quantityUnit:["kg","tin","pack"].includes(b.quantityUnit)?b.quantityUnit:"kg",lowStockThreshold:threshold,wholesalePricePerTin:wholesale,tinWeightKg:tin,retailPackWeightKg:retailWeight,retailPricePerPack:retail,retailPricePerKg:null,retailPacks,wholesaleOptions,retailDisplayMode:["all","starting","default"].includes(b.retailDisplayMode)?b.retailDisplayMode:"all",defaultRetailPackId:retailPacks[0]?.id||null,showWholesalePrice:b.showWholesalePrice!==false,isActive:b.isActive!==false,updatedAt:new Date().toISOString()};
    store.products.push(product);writeStore(store);res.status(201).json(product);
  } catch(e) { res.status(400).json({error:e.message||"Unable to create product."}); }
});
app.get("/api/admin/products",requireAdmin,(_req,res)=>res.json(readStore().products));
app.put("/api/admin/products/:id",requireAdmin,(req,res)=>{
  const b=req.body||{}; const store=readStore(); const idx=store.products.findIndex(p=>p.id===req.params.id);
  if(idx<0) return res.status(404).json({error:"Product not found."});
  const quantity=Number(b.availableQuantity), threshold=Number(b.lowStockThreshold), tin=Number(b.tinWeightKg);
  const wholesale=b.wholesalePricePerTin===""||b.wholesalePricePerTin===null?null:Number(b.wholesalePricePerTin);
  const retail=b.retailPricePerPack===""||b.retailPricePerPack===null?null:Number(b.retailPricePerPack);
  const retailWeight=Number(b.retailPackWeightKg); const parseOptions=(value,fallback)=>{if(value===undefined)return fallback;if(!Array.isArray(value))throw new Error("Pack options must be an array.");return value.map((o,i)=>({id:cleanText(o.id||`${i+1}`,80),label:cleanText(o.label,80)||`${Number(o.weightKg)||1} kg pack`,weightKg:Number(o.weightKg),price:o.price===""||o.price==null?null:Number(o.price),enabled:o.enabled!==false})).filter(o=>o.weightKg>0&&Number.isFinite(o.weightKg)&&(o.price===null||(Number.isFinite(o.price)&&o.price>=0))&&o.price!==undefined);};
  if(typeof b.name!=="string"||!b.name.trim()||b.name.length>160) return res.status(400).json({error:"Product name is required (maximum 160 characters)."});
  if(!Number.isFinite(quantity)||quantity<0||!Number.isFinite(threshold)||threshold<0||!Number.isFinite(tin)||tin<=0||!Number.isFinite(retailWeight)||retailWeight<=0) return res.status(400).json({error:"Quantity and threshold must be zero or more; tin weight must be greater than zero."});
  if(wholesale!==null&&(!Number.isFinite(wholesale)||wholesale<0)||retail!==null&&(!Number.isFinite(retail)||retail<0)) return res.status(400).json({error:"Prices must be zero or more, or left blank."});
  const requested=b.stockStatus;
  if(!["In Stock","Low Stock","Out of Stock","Not Set"].includes(requested)) return res.status(400).json({error:"Choose a valid stock status."});
  let status=requested==="Not Set"?"unknown":requested==="Out of Stock"||quantity===0?"Out of Stock":quantity<threshold?"Low Stock":"In Stock";
  if(requested==="Low Stock"&&quantity>0) status="Low Stock";
  if(requested==="In Stock"&&quantity>0&&quantity>=threshold) status="In Stock";
  const old=store.products[idx]; let retailPacks,wholesaleOptions; try{retailPacks=parseOptions(b.retailPacks,old.retailPacks);wholesaleOptions=parseOptions(b.wholesaleOptions,old.wholesaleOptions);}catch(e){return res.status(400).json({error:e.message});}
  const displayMode=["all","starting","default"].includes(b.retailDisplayMode)?b.retailDisplayMode:"all";
  const availableRetail=retailPacks.filter(o=>o&&o.enabled!==false&&Number(o.price)>0&&Number(o.weightKg)>0);
  const requestedDefault=String(b.defaultRetailPackId||"");
  const defaultRetailPackId=availableRetail.some(o=>String(o.id)===requestedDefault)?requestedDefault:(availableRetail[0]?.id||null);
  store.products[idx]={...old,retailPacks,wholesaleOptions,retailDisplayMode:displayMode,defaultRetailPackId,showWholesalePrice:b.showWholesalePrice!==false,name:b.name.trim(),category:String(b.category||old.category).slice(0,80),description:String(b.description||"").slice(0,500),image:b.imageData?saveProductImage(b.imageData):old.image,
    stockStatus:status,availableQuantity:quantity,quantityUnit:["kg","tin","pack"].includes(b.quantityUnit)?b.quantityUnit:"kg",
    lowStockThreshold:threshold,wholesalePricePerTin:wholesale,tinWeightKg:tin,retailPackWeightKg:retailWeight,retailPricePerPack:retail,retailPricePerKg:null,isActive:b.isActive!==false,updatedAt:new Date().toISOString()};
  writeStore(store); res.json(store.products[idx]);
});

app.delete("/api/admin/products/:id",requireAdmin,(req,res)=>{
  const store=readStore(),idx=store.products.findIndex(p=>String(p.id)===String(req.params.id));
  if(idx<0)return res.status(404).json({error:"Product not found."});
  store.products.splice(idx,1);writeStore(store);res.json({ok:true});
});
app.delete("/api/admin/order-enquiries/:id",requireAdmin,(req,res)=>{
  const store=readStore(),e=store.enquiries.find(x=>x.type==="Cart Order"&&(x.id===req.params.id||x.reference===req.params.id));
  if(!e)return res.status(404).json({error:"Order not found."});
  e.archivedAt=new Date().toISOString();e.updatedAt=e.archivedAt;writeStore(store);res.json({ok:true,archivedAt:e.archivedAt});
});
app.get("/api/admin/order-enquiries/export/excel",requireAdmin,async(_req,res)=>{
  try {
    const store=readStore(),orders=store.enquiries.filter(e=>e.type==="Cart Order").sort((a,b)=>String(a.createdAt).localeCompare(String(b.createdAt)));
    const workbook=new ExcelJS.Workbook();workbook.creator="Jai Veera Hanuman Cashew Processor Trading & Co.";workbook.created=new Date();
    const os=workbook.addWorksheet("Orders"),is=workbook.addWorksheet("Order Items");
    os.columns=[{header:"Order ID",key:"id",width:34},{header:"Reference",key:"reference",width:24},{header:"Date",key:"date",width:22},{header:"Customer",key:"customer",width:24},{header:"Phone",key:"phone",width:18},{header:"Email",key:"email",width:28},{header:"Address",key:"address",width:42},{header:"City",key:"city",width:18},{header:"State",key:"state",width:18},{header:"PIN",key:"pin",width:12},{header:"Subtotal (INR)",key:"subtotal",width:16},{header:"Discount (INR)",key:"discount",width:16},{header:"GST (INR)",key:"tax",width:14},{header:"Shipping (INR)",key:"shipping",width:16},{header:"Delivery (INR)",key:"delivery",width:16},{header:"Estimated Total (INR)",key:"total",width:22},{header:"Status",key:"status",width:22}];
    is.columns=[{header:"Order ID",key:"id",width:34},{header:"Reference",key:"reference",width:24},{header:"Product",key:"product",width:36},{header:"Category",key:"category",width:18},{header:"Variant",key:"variant",width:28},{header:"Quantity",key:"quantity",width:12},{header:"Unit Price (INR)",key:"price",width:18},{header:"Line Subtotal (INR)",key:"subtotal",width:20}];
    const safeCell=v=>typeof v==="string"&&/^[\s]*[=+\-@]/.test(v)?"'"+v:v;
    for(const o of orders){const c=o.customer||{};os.addRow({id:safeCell(o.id),reference:safeCell(o.reference),date:o.createdAt?new Date(o.createdAt):null,customer:safeCell(c.name),phone:safeCell(c.phone),email:safeCell(c.email),address:safeCell(c.address),city:safeCell(c.city),state:safeCell(c.state),pin:safeCell(c.pin),subtotal:Number(o.subtotal||0),discount:Number(o.discountAmount||0),tax:Number(o.taxAmount||0),shipping:Number(o.shippingCharge||0),delivery:Number(o.deliveryCharge||0),total:Number(o.estimatedTotal||0),status:safeCell(o.status)});for(const item of o.items||[])is.addRow({id:safeCell(o.id),reference:safeCell(o.reference),product:safeCell(item.name),category:safeCell(item.category),variant:safeCell(item.variantLabel||item.variantType),quantity:Number(item.quantity||0),price:Number(item.unitPrice||0),subtotal:Number(item.subtotal||Number(item.quantity||0)*Number(item.unitPrice||0))});}
    for(const ws of [os,is]){ws.getRow(1).font={bold:true};ws.views=[{state:"frozen",ySplit:1}];ws.autoFilter={from:{row:1,column:1},to:{row:1,column:ws.columnCount}};ws.eachRow((row,r)=>{if(r>1)row.eachCell(cell=>{if(typeof cell.value==="number")cell.numFmt='#,##0.00';});});}
    os.getColumn("date").numFmt="yyyy-mm-dd hh:mm";
    res.setHeader("Content-Type","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");res.setHeader("Content-Disposition",`attachment; filename="JaiVeeraHanuman_Orders_${new Date().toISOString().slice(0,10)}.xlsx"`);res.setHeader("Cache-Control","no-store");
    await workbook.xlsx.write(res);res.end();
  } catch(e){if(!res.headersSent)res.status(500).json({error:"Unable to export orders. Please try again."});}
});
app.get("/api/admin/dashboard",requireAdmin,(_req,res)=>{
  const s=readStore(), today=new Date().toISOString().slice(0,10), active=s.products.filter(p=>p.isActive);
  const days=Array.from({length:30},(_,i)=>{const d=new Date();d.setUTCDate(d.getUTCDate()-(29-i));return d.toISOString().slice(0,10);});
  const daily=days.map(day=>({day,visits:s.visits.filter(v=>v.day===day).length}));
  res.json({totalProducts:active.length,inStock:active.filter(p=>p.stockStatus==="In Stock").length,lowStock:active.filter(p=>p.stockStatus==="Low Stock").length,outOfStock:active.filter(p=>p.stockStatus==="Out of Stock").length,totalVisitors:s.visits.length,visitorsToday:s.visits.filter(v=>v.day===today).length,daily,stockDistribution:[
    {label:"In Stock",value:active.filter(p=>p.stockStatus==="In Stock").length},{label:"Low Stock",value:active.filter(p=>p.stockStatus==="Low Stock").length},{label:"Out of Stock",value:active.filter(p=>p.stockStatus==="Out of Stock").length},{label:"Not Set",value:active.filter(p=>p.stockStatus==="unknown").length}
  ]});
});
app.get("/admin/login",(_req,res)=>res.sendFile(path.join(publicDir,"admin-login.html")));
app.get("/admin/dashboard",(req,res)=>{if(!isAdmin(req)) return res.redirect("/admin/login"); res.sendFile(path.join(__dirname,"..","private","admin.html"));});
app.use(express.static(publicDir,{extensions:["html"]}));
app.get("*",(_req,res)=>res.sendFile(path.join(publicDir,"index.html")));
app.listen(PORT,"0.0.0.0",()=> {
  ensureStore();
  console.log(`Jai Veera Hanuman website running on port ${PORT}`);
  if(process.env.NODE_ENV==="production" && (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET)) console.warn("Admin login disabled until ADMIN_PASSWORD and SESSION_SECRET are configured.");
});
