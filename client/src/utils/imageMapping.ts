const venueImages: Record<string, string> = {
    'tech_conf': '/images/venues/tech_conf.jpeg',
    'hyatt_regency_ahm': '/images/venues/hyatt_regency_ahm.jpg',
    'itc_gardenia_blr': '/images/venues/itc_gardenia_blr.jpeg',
    'itc_maurya_delhi': '/images/venues/itc_maurya_delhi.png',
    'jw_marriott_blr': '/images/venues/jw_marriott_blr.jpg',
    'leela_palace_blr': '/images/venues/leela_palace_blr.jpg',
    'novotel_hyd': '/images/venues/novotel_hyd.jpg',
    'oberoi_delhi': '/images/venues/oberoi_delhi.jpg',
    'radisson_blu_hyd': '/images/venues/radisson_blu_hyd.jpg',
    'taj_lands_end': '/images/venues/taj_lands_end.jpg',
    'tc_event': '/images/venues/tc_event.jpg'
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
    'web3_work': '/images/events/web3_work.png'
};

export const getEventImage = (imageName: string): string => {
    return eventImages[imageName] || '/images/events/default-event.jpg';
};


export const getVenueImage = (imageName: string): string => {
    return venueImages[imageName] || '/images/venues/default-venue.jpg';
};