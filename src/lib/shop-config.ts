export const shop = {
  name: "Ruthy's Collection",
  tagline: "Quality Finds, Just for You",
  
  phoneLocal: "0706 795 6301",
  whatsappNumber: "2347067956301",
  email: "salatyruthfriday@gmail.com",
  location: "Kano, Nigeria",
  hours: "Mon – Sat, 9:00am – 7:00pm",
  socials: {
    instagram: "https://www.instagram.com/friday63874?stkn=c2VndXZ1NHhpZDVz",
    facebook: "https://www.facebook.com/share/1Ex21nH52L/?mibextid=wwXIfr",
    tiktok: "https://tiktok.com/@user4519940207723",
  },
  delivery: {
    homeFee: 2000,
    pickupFee: 0,
    freeOver: 75000,
  },
} as const;

export function formatNaira(amount: number) {
  return `\u20A6${amount.toLocaleString("en-NG")}`;
}
