export const CLOUDINARY_IMAGES = {
  // TODO: Current Assets - To be added when we have the proper Cloudinary IDs
  // AUGUSTA_CLUBHOUSE: "",
  // MASTERS_LOGO: "",
  
  // TODO: Current Champions - To be added when we have the proper Cloudinary IDs
  // CURRENT_CHAMPIONS: {
  //   RAHM_2023: "",      // Jon Rahm's victory
  //   SCHEFFLER_2022: "", // Scottie Scheffler's dominant win
  //   MATSUYAMA_2021: "", // Hideki Matsuyama's historic win
  // },

  // Historical Masters Moments Collection
  // Format: MastersPool/MastersPool/Images/{publicId}.avif
  HISTORICAL_MOMENTS: {
    BUBBA_2012: "MastersPool/MastersPool/Images/wmpg28zoco5xsqgx8m9w",      // Bubba Watson's incredible shot from the trees
    LOUIS_2012: "MastersPool/MastersPool/Images/sanw0opoeaep3parjlcz",      // Louis Oosthuizen's albatross on hole 2
    PHIL_2010: "MastersPool/MastersPool/Images/ynzl2trmrv6krbfzjpoh",       // Phil's shot from the pine straw
    TIGER_2005: "MastersPool/MastersPool/Images/rb29daxcjpppszuv5klh",      // Tiger's chip-in on 16
    SLUMAN_1992: "MastersPool/MastersPool/Images/wtxw8my0jvkl2pcbmtqk",     // Jeff Sluman's ace on 4
    LYLE_1988: "MastersPool/MastersPool/Images/lhpt9iuhkie6fbhdmqpg",       // Sandy Lyle's birdie from the bunker
    MIZE_1987: "MastersPool/MastersPool/Images/royxjmftfw0wiatwc8yp",       // Larry Mize's playoff chip-in
    JACK_1986: "MastersPool/MastersPool/Images/g4ejcg1n774ajingsmqf",       // Jack's back nine charge
    JACK_1975: "MastersPool/MastersPool/Images/u2ycqwznya5douligc5d",       // Nicklaus vs. Weiskopf vs. Miller
    ARNIE_1962: "MastersPool/MastersPool/Images/h5ymu7ezhnjjgt9cwjlp",      // Palmer's playoff victory
    PATTON_1954: "MastersPool/MastersPool/Images/cpyegdasujhvv8ocxvxj",     // Billy Joe Patton's amateur run
    SARAZEN_1935: "MastersPool/MastersPool/Images/ptdb7zqf0gc5iqdbwhgl"     // The "Shot Heard 'Round the World"
  }
} as const;

// Type for the historical moments to ensure type safety
export type HistoricalMomentKey = keyof typeof CLOUDINARY_IMAGES.HISTORICAL_MOMENTS;

// Helper function to get a random historical moment image ID
export function getRandomHistoricalMomentId(): string {
  const moments = Object.values(CLOUDINARY_IMAGES.HISTORICAL_MOMENTS);
  const randomIndex = Math.floor(Math.random() * moments.length);
  return moments[randomIndex];
} 