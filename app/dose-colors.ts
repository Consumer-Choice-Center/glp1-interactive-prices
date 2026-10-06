// Product-label colours observed in the supplied manufacturer package references.
// Products without a documented per-dose reference retain their brand accent.
export const doseColors: Record<string, Record<string, string>> = {
  wegovy: {"0.25":"#55c7b5","0.5":"#aa507c","1":"#a4662d","1.7":"#067da9","2.4":"#263a48","7.2":"#aa83bd"},
  "oral-wegovy": {"1.5":"#70cdbd","4":"#bb668d","9":"#af7236","25":"#1c8cb5"},
  zepbound: {"2.5":"#727881","5":"#74477d","7.5":"#238f83","10":"#c8658b","12.5":"#3f78b5","15":"#d77932"}
};
export const productDoseColor=(id:string,dose:string|undefined,fallback:string)=>doseColors[id]?.[dose||""]||fallback;
