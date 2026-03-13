const movieImages: Record<string, string> = {
  'avengers-endgame': new URL('../assets/movies/posters/avengers-endgame.jpeg', import.meta.url).href,
  '3-idiots': new URL('../assets/movies/posters/3-idiots.jpeg', import.meta.url).href,
  'inception': new URL('../assets/movies/posters/inception.jpeg', import.meta.url).href,
  'kgf': new URL('../assets/movies/posters/kgf.webp', import.meta.url).href,
  'dark-knight': new URL('../assets/movies/posters/dark-knight.jpeg', import.meta.url).href,
  'rrr': new URL('../assets/movies/posters/rrr.jpeg', import.meta.url).href,
  'interstellar': new URL('../assets/movies/posters/interstellar.jpeg', import.meta.url).href,
  'dangal': new URL('../assets/movies/posters/dangal.webp', import.meta.url).href,
  'spiderman-nwh': new URL('../assets/movies/posters/spiderman-nwh.jpeg', import.meta.url).href,
  'dune': new URL('../assets/movies/posters/dune.jpeg', import.meta.url).href,
};

const movieBackdrops: Record<string, string> = {
  'avengers-endgame': new URL('../assets/movies/backdrops/avengers-endgame.jpeg', import.meta.url).href,
  '3-idiots': new URL('../assets/movies/backdrops/3-idiots.webp', import.meta.url).href,
  'inception': new URL('../assets/movies/backdrops/inception.jpg', import.meta.url).href,
  'kgf': new URL('../assets/movies/backdrops/kgf.webp', import.meta.url).href,
  'dark-knight': new URL('../assets/movies/backdrops/dark-knight.jpg', import.meta.url).href,
  'rrr': new URL('../assets/movies/backdrops/rrr.webp', import.meta.url).href,
  'interstellar': new URL('../assets/movies/backdrops/interstellar.webp', import.meta.url).href,
  'dangal': new URL('../assets/movies/backdrops/dangal.webp', import.meta.url).href,
  'spiderman-nwh': new URL('../assets/movies/backdrops/spiderman-nwh.webp', import.meta.url).href,
  'dune': new URL('../assets/movies/backdrops/dune.webp', import.meta.url).href,
};

const venueImages: Record<string, string> = {
  'hyatt_regency_ahm': new URL('../assets/venues/posters/hyatt_regency_ahm.jpg', import.meta.url).href,
  'itc_gardenia_blr': new URL('../assets/venues/posters/itc_gardenia_blr.jpeg', import.meta.url).href,
  'itc_maurya_delhi': new URL('../assets/venues/posters/itc_maurya_delhi.png', import.meta.url).href,
  'jw_marriott_blr': new URL('../assets/venues/posters/jw_marriott_blr.jpg', import.meta.url).href,
  'leela_palace_blr': new URL('../assets/venues/posters/leela_palace_blr.jpg', import.meta.url).href,
  'novotel_hyd': new URL('../assets/venues/posters/novotel_hyd.jpg', import.meta.url).href,
  'oberoi_delhi': new URL('../assets/venues/posters/oberoi_delhi.jpg', import.meta.url).href,
  'radisson_blu_hyd': new URL('../assets/venues/posters/radisson_blu_hyd.jpg', import.meta.url).href,
  'taj_lands_end': new URL('../assets/venues/posters/taj_lands_end.jpg', import.meta.url).href,
  'tc_event': new URL('../assets/venues/posters/tc_event.jpg', import.meta.url).href,
  'tech_conf': new URL('../assets/venues/posters/tech_conf.jpeg', import.meta.url).href,
};

const eventImages: Record<string, string> = {
  'ai_startup': '/images/events/ai_startup.jpg',
  'boly_prod': '/images/events/boly_prod.jpg',
  'cloud_arch': '/images/events/cloud_arch.jpg',
  'corp_awards': '/images/events/corp_awards.jpg',
  'digi_market': '/images/events/digi_market.jpg',
  'fashion_gala': '/images/events/fashion_gala.jpg',
  'finance_summit': '/images/events/finance_summit.png',
  'luxury_retail': '/images/events/luxury_retail.jpg',
  'web3_work': '/images/events/web3_work.png',
};

export const getMovieImage = (imageName: string): string => {
  return movieImages[imageName] || new URL('../assets/movies/posters/placeholder.jpeg', import.meta.url).href;
};

export const getMovieBackdrop = (imageName: string): string => {
  return movieBackdrops[imageName] || '';
};

export const getVenueImage = (imageName: string): string => {
  return venueImages[imageName] || new URL('../assets/venues/posters/placeholder.jpg', import.meta.url).href;
};

export const getEventImage = (imageName: string): string => {
  return eventImages[imageName] || '/images/events/placeholder.jpg';
};