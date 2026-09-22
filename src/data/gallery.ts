export interface PhotoItem {
  id: string;
  albumSlug: string;
  titleEn: string;
  titleTa: string;
  captionEn: string;
  captionTa: string;
  imageUrl: string;
  photographer: string;
  eventDate: string;
  tags: string[];
}

export interface GalleryAlbum {
  slug: string;
  titleEn: string;
  titleTa: string;
  eventSlug: string;
  academicYear: string;
  coverImage: string;
  photoCount: number;
  descriptionEn: string;
  descriptionTa: string;
  googlePhotosUrl?: string;
  photos: PhotoItem[];
}

export const GALLERY_ALBUMS: GalleryAlbum[] = [
  {
    slug: "berry-cute-picnic",
    titleEn: 'TS "A Berry Cute Picnic"',
    titleTa: 'பெர்ரி க்யூட் பிக்னிக் (இலையுதிர் சங்கமம்)',
    eventSlug: "berry-cute-picnic",
    academicYear: "2024-2025",
    coverImage: "https://lh3.googleusercontent.com/pw/AP1GczPxXus-6uP7LIoxTDLr2AgeSboBWSr6f-dGCHtPo9UEFq5ma-J6R-eGsQR9sQOwZ_GWUviWZQjfpzbVvN0wMwhe2GqjILtW8nThJrxg1IR2WY-MU_uL=w1200-h800-no",
    photoCount: 31,
    googlePhotosUrl: "https://photos.app.goo.gl/XUS5MJz4vFRSefJa7",
    descriptionEn: "Annual fall semester welcome picnic on the South Oval with fresh berries, blankets, lawn games, and warm community bonding.",
    descriptionTa: "புதிய மற்றும் மூத்த மாணவர்களை ஒன்றிணைக்கும் இலையுதிர்கால புல்வெளி பிக்னிக், விளையாட்டு மற்றும் தோழமை சங்கமம்.",
    photos: [
      {
            "id": "berry-cute-picnic-01",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Welcome to the Picnic",
            "titleTa": "பிக்னிக் வரவேற்பு",
            "captionEn": "Buckeyes gathering on the South Oval for the fall welcome picnic.",
            "captionTa": "இலையுதிர்கால பிக்னிக்கிற்காக ஓவல் புல்வெளியில் திரண்ட மாணவர்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPxXus-6uP7LIoxTDLr2AgeSboBWSr6f-dGCHtPo9UEFq5ma-J6R-eGsQR9sQOwZ_GWUviWZQjfpzbVvN0wMwhe2GqjILtW8nThJrxg1IR2WY-MU_uL=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "picnic",
                  "oval",
                  "community",
                  "fall"
            ]
      },
      {
            "id": "berry-cute-picnic-02",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Fresh Berry Table",
            "titleTa": "புதிய பழங்கள் அரங்கம்",
            "captionEn": "Strawberries, blueberries, pastries, and refreshments prepared for attendees.",
            "captionTa": "ஸ்ட்ராபெர்ரி, ப்ளூபெர்ரி மற்றும் சுவையான சிற்றுண்டிகள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPYC0WAe9V07JbvAfxV4lcTbzIKpJN3gO5Y4Rg7i8khdxDyW34OgZrQFWQFoOxQib3ypvzE2x1lNQV2Spp_UUH2co3DjcSFGuQ7NO15cRPZeL4dG7Pz=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "food",
                  "picnic",
                  "sweets"
            ]
      },
      {
            "id": "berry-cute-picnic-03",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Lawn Games & Laughter",
            "titleTa": "புல்வெளி விளையாட்டுகள்",
            "captionEn": "Members competing in frisbee, badminton, and outdoor yard games.",
            "captionTa": "உறுப்பினர்கள் உற்சாகமாக விளையாடிய புல்வெளி விளையாட்டுகள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczOy4Y-Gl5o10D5AST9dGunYua9Hqde-tLbTTPwd3s3jFl5FnsWeecYBYDI14b2PR97Jeel_HzylFFl2c-SFIKpTx2nbSo__Gko9eWdQBrf7hXw4Wr5m=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "games",
                  "picnic",
                  "lawn"
            ]
      },
      {
            "id": "berry-cute-picnic-04",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Campus Fellowship",
            "titleTa": "தோழமை தருணம்",
            "captionEn": "New freshmen connecting with upperclassmen and making lifelong friends.",
            "captionTa": "புதிய மற்றும் மூத்த மாணவர்கள் ஒன்றிணைந்து பழகிய இனிமையான நேரம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczM27IFXsu1l2lOJmCu9nD_SAYPYy5VWB6CKeOunJwmnh4PbsVHULRU8HUoF3RkGrNd85QC9Y5nZ_RUGATeCFv1xAOIE3-SRA9P3-etrO_KgIhbBXUoO=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "community",
                  "bonding",
                  "friends"
            ]
      },
      {
            "id": "berry-cute-picnic-05",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Autumn Afternoon Sun",
            "titleTa": "இலையுதிர் மாலை வெயில்",
            "captionEn": "Enjoying the golden hour breeze across the central campus green.",
            "captionTa": "வளாகத்தின் பொன்மாலை வெயிலில் மாணவர்கள் ஓய்வு.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczMOMf6vecxH1UegBdI4ZI277S52LaN52_RSMIFlcf7ZN-DSednAeFfuCo8CX7rujU8nj5cYo5eUVT5Fh9t0Nw2f7fRsuYlEgvmUA3aHexnw6swPgS8x=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "nature",
                  "oval",
                  "fall"
            ]
      },
      {
            "id": "berry-cute-picnic-06",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Smiles & Selfies",
            "titleTa": "மகிழ்ச்சி தருணங்கள்",
            "captionEn": "Capturing candid polaroid and phone memories with the executive board.",
            "captionTa": "நிர்வாகக் குழுவினருடன் மாணவர்கள் எடுத்துக்கொண்ட புகைப்படங்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPWefUXIIO77vdYH4UJ29nw3A-a6sNiTqsyPPjOcyDL-REYImIGNWDDuaLqwg1ouQv0vJubUpDCLFbCJl63OLTit9z_T6_t9hutMpF_GNvqhzX11QTT=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "portraits",
                  "candid",
                  "friends"
            ]
      },
      {
            "id": "berry-cute-picnic-07",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Picnic Blanket Circles",
            "titleTa": "பிக்னிக் வட்டங்கள்",
            "captionEn": "Groups sitting on checkered blankets sharing stories and laughs.",
            "captionTa": "பாய்களில் வட்டமாக அமர்ந்து கதைகள் பேசிய மாணவர்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczMWSUUQl3AAeAYv3zGrhfRjApcsKgBEwpc0nAyn-g_8V3tzvaw0MkMua2JNdR2bN8Ex6WGPQXymdbB4p94rIMe9g_bJq-kSwp9otE5bPmFrJ3YUuzW1=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "picnic",
                  "friends",
                  "lawn"
            ]
      },
      {
            "id": "berry-cute-picnic-08",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Board Game Battles",
            "titleTa": "பலகை விளையாட்டு",
            "captionEn": "Intense rounds of card games, Uno, and cultural trivia under the trees.",
            "captionTa": "மரங்களின் நிழலில் நடைபெற்ற சுவாரசியமான பலகை விளையாட்டுகள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPtuJCoIshg6EZ0nCG3vNDXp_2dUklyQ3GLgyE3b6Lu41905XLlyFW3jH6M0lnG_w_Z1lIytFOvJwisP0ggqcId0T1IWKt8OKsnB9ltOSU09PFGG8LE=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "games",
                  "picnic",
                  "trivia"
            ]
      },
      {
            "id": "berry-cute-picnic-09",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Welcome to the Picnic (9)",
            "titleTa": "பிக்னிக் வரவேற்பு (9)",
            "captionEn": "Buckeyes gathering on the South Oval for the fall welcome picnic.",
            "captionTa": "இலையுதிர்கால பிக்னிக்கிற்காக ஓவல் புல்வெளியில் திரண்ட மாணவர்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczO_Q30no6D5kYea_E_L1MB1NTLBiM4Xs0K4nv21uFutBRCaMhFrX_iANe-0EC7NVVrpvP6UDWWQJIDV3b8eyG5SlQPOllmJzGJlyxax93gULAF_bOgo=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "picnic",
                  "oval",
                  "community",
                  "fall"
            ]
      },
      {
            "id": "berry-cute-picnic-10",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Fresh Berry Table (10)",
            "titleTa": "புதிய பழங்கள் அரங்கம் (10)",
            "captionEn": "Strawberries, blueberries, pastries, and refreshments prepared for attendees.",
            "captionTa": "ஸ்ட்ராபெர்ரி, ப்ளூபெர்ரி மற்றும் சுவையான சிற்றுண்டிகள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczO4EaILoiUmHZp6fotBhqF3Fv7idAxqOUDucsgPPwcM_PGnefJgVKbMTFs-DRcXm5rkCrIViMQWpeYFcGLGgA--n6c8f5E1TQfBPPCCGFtwdQ21zKu0=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "food",
                  "picnic",
                  "sweets"
            ]
      },
      {
            "id": "berry-cute-picnic-11",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Lawn Games & Laughter (11)",
            "titleTa": "புல்வெளி விளையாட்டுகள் (11)",
            "captionEn": "Members competing in frisbee, badminton, and outdoor yard games.",
            "captionTa": "உறுப்பினர்கள் உற்சாகமாக விளையாடிய புல்வெளி விளையாட்டுகள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczP8doCir7qP9YsO7kusdiQiMne7QhIjkILBcZBv1SkhcvXl4gU4zNDaWzUJSgj1BI7Waq_18FfHrEOQNCSkHZ7j8OydWLdoE5axTINiM8TI563JOtjp=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "games",
                  "picnic",
                  "lawn"
            ]
      },
      {
            "id": "berry-cute-picnic-12",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Campus Fellowship (12)",
            "titleTa": "தோழமை தருணம் (12)",
            "captionEn": "New freshmen connecting with upperclassmen and making lifelong friends.",
            "captionTa": "புதிய மற்றும் மூத்த மாணவர்கள் ஒன்றிணைந்து பழகிய இனிமையான நேரம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczOai6mF4FMmvd4zqRC4mYzRxLRC_ZJ0rHGJfHmiw02oyI2k0s7BVdlvo7LDc1Kao06sEVYvhuEZZtgKVzmGBXj4dx2D75keYvq6xyBWFuoRyrYQz_ON=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "community",
                  "bonding",
                  "friends"
            ]
      },
      {
            "id": "berry-cute-picnic-13",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Autumn Afternoon Sun (13)",
            "titleTa": "இலையுதிர் மாலை வெயில் (13)",
            "captionEn": "Enjoying the golden hour breeze across the central campus green.",
            "captionTa": "வளாகத்தின் பொன்மாலை வெயிலில் மாணவர்கள் ஓய்வு.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczO_UKRFe43cXOYFj6CY6CaBofOCXJG9NqiSBv82Eha-Mw-EszvBa9JlmXlmfRAm2WdC_5ZjHGkivnupL9mY9wjBh7-KMkpYGE0OLW_mBrLnfUQ0Yh43=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "nature",
                  "oval",
                  "fall"
            ]
      },
      {
            "id": "berry-cute-picnic-14",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Smiles & Selfies (14)",
            "titleTa": "மகிழ்ச்சி தருணங்கள் (14)",
            "captionEn": "Capturing candid polaroid and phone memories with the executive board.",
            "captionTa": "நிர்வாகக் குழுவினருடன் மாணவர்கள் எடுத்துக்கொண்ட புகைப்படங்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczMwEAQjO6RfmVlwZQxNsyM9MXB3pVdZcuTPuo32fIqbPiSKSAuQbjfxKpAsAaeTuVm92wdF2tmlm0teK20iDUxOwLzv376mWNct-dGLa4HMbbtay6L8=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "portraits",
                  "candid",
                  "friends"
            ]
      },
      {
            "id": "berry-cute-picnic-15",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Picnic Blanket Circles (15)",
            "titleTa": "பிக்னிக் வட்டங்கள் (15)",
            "captionEn": "Groups sitting on checkered blankets sharing stories and laughs.",
            "captionTa": "பாய்களில் வட்டமாக அமர்ந்து கதைகள் பேசிய மாணவர்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczNRd14vkNXPTcWgS4OBdvdcgtIpSYEjk32_5QqJ-QOHbSTmmWvwtTKGhU1yTs7ZHEuQTj9iejYcdM_OgTvZEZk97mCOWc3DPiq94NojfTh2M0uNeiW6=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "picnic",
                  "friends",
                  "lawn"
            ]
      },
      {
            "id": "berry-cute-picnic-16",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Board Game Battles (16)",
            "titleTa": "பலகை விளையாட்டு (16)",
            "captionEn": "Intense rounds of card games, Uno, and cultural trivia under the trees.",
            "captionTa": "மரங்களின் நிழலில் நடைபெற்ற சுவாரசியமான பலகை விளையாட்டுகள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczNaMYyNQBkWRcoMWto9Hg0wURL41FcZL4rjfnrMexu01egwbPmyOgVssW1SGsnMc_vsOoD3hz_kyn_cvrpoTrNu7BPNdAYVWYM55k-Z3Wys6VsnZj4R=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "games",
                  "picnic",
                  "trivia"
            ]
      },
      {
            "id": "berry-cute-picnic-17",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Welcome to the Picnic (17)",
            "titleTa": "பிக்னிக் வரவேற்பு (17)",
            "captionEn": "Buckeyes gathering on the South Oval for the fall welcome picnic.",
            "captionTa": "இலையுதிர்கால பிக்னிக்கிற்காக ஓவல் புல்வெளியில் திரண்ட மாணவர்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczM5nvc5fHvSfwHIbh2PDEWbviJ2RhI7uEDCJkEN2q4MdlDdixP2uUGgRJOiKTVvxCyU8cfiE8H_r1MNSUakY_bnftiaACvUj8i1UcYmAYVXoasOCuTE=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "picnic",
                  "oval",
                  "community",
                  "fall"
            ]
      },
      {
            "id": "berry-cute-picnic-18",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Fresh Berry Table (18)",
            "titleTa": "புதிய பழங்கள் அரங்கம் (18)",
            "captionEn": "Strawberries, blueberries, pastries, and refreshments prepared for attendees.",
            "captionTa": "ஸ்ட்ராபெர்ரி, ப்ளூபெர்ரி மற்றும் சுவையான சிற்றுண்டிகள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczMud0lZ-OB7_yjMLX9uRgYHrk_LNGQixscgKU6IGQ2aqQ_4wxgcBakvLPia1xJMDatC6pGifO6MS6i1E2ihTGxxNCFjDK2EMyxVTGab1RzlMNwlsgZb=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "food",
                  "picnic",
                  "sweets"
            ]
      },
      {
            "id": "berry-cute-picnic-19",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Lawn Games & Laughter (19)",
            "titleTa": "புல்வெளி விளையாட்டுகள் (19)",
            "captionEn": "Members competing in frisbee, badminton, and outdoor yard games.",
            "captionTa": "உறுப்பினர்கள் உற்சாகமாக விளையாடிய புல்வெளி விளையாட்டுகள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczNk3OF312L_q3a0SuiwtUFA7a8PAeIm0odg8d7Dqi5pgCF7PsjM_ulyUwhzQrYlQKL5W_fFz-jaWHRxjO1yyY3FusdpJmlM78U6OlLIl30ShHt_p3ZA=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "games",
                  "picnic",
                  "lawn"
            ]
      },
      {
            "id": "berry-cute-picnic-20",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Campus Fellowship (20)",
            "titleTa": "தோழமை தருணம் (20)",
            "captionEn": "New freshmen connecting with upperclassmen and making lifelong friends.",
            "captionTa": "புதிய மற்றும் மூத்த மாணவர்கள் ஒன்றிணைந்து பழகிய இனிமையான நேரம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczMbzEwsgKdAngSheRscMuZix29atQ6FkUukvIPQOfdIWWjUXyZhZksGdoij7GYKFu1mAcN34niQPyQQFSdeCV-kmDoPxbL8xsjwLCtnQPtFfyqGQm3q=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "community",
                  "bonding",
                  "friends"
            ]
      },
      {
            "id": "berry-cute-picnic-21",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Autumn Afternoon Sun (21)",
            "titleTa": "இலையுதிர் மாலை வெயில் (21)",
            "captionEn": "Enjoying the golden hour breeze across the central campus green.",
            "captionTa": "வளாகத்தின் பொன்மாலை வெயிலில் மாணவர்கள் ஓய்வு.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczO6D-H3-qKOI4ubnEmtD9_SPBFMkmz-YFCjMfu9b_Uk1bsVZf158f11cvO9hUxwaMluY8sH5PviZvmj9mEkV2U-iyjXl21y70HcVjJiznjW33yJ5kuK=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "nature",
                  "oval",
                  "fall"
            ]
      },
      {
            "id": "berry-cute-picnic-22",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Smiles & Selfies (22)",
            "titleTa": "மகிழ்ச்சி தருணங்கள் (22)",
            "captionEn": "Capturing candid polaroid and phone memories with the executive board.",
            "captionTa": "நிர்வாகக் குழுவினருடன் மாணவர்கள் எடுத்துக்கொண்ட புகைப்படங்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczOdehFuJLAxjkdIUuNU81_YAEVLVi6aCMMvZ_N__khC5gsOnJ4QG9IeoQ2y6T3r4VwEMSX4xHuoLD1nnOXfE-0JAL7sLvBUuQbucC4wHfd6byWzLyWF=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "portraits",
                  "candid",
                  "friends"
            ]
      },
      {
            "id": "berry-cute-picnic-23",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Picnic Blanket Circles (23)",
            "titleTa": "பிக்னிக் வட்டங்கள் (23)",
            "captionEn": "Groups sitting on checkered blankets sharing stories and laughs.",
            "captionTa": "பாய்களில் வட்டமாக அமர்ந்து கதைகள் பேசிய மாணவர்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczNzzSEuECuDe6xQfePBXyglcUzwW6pwKXbymq2if7N2tOSjnViRqt9rvGkOm_ro2ZVbDskKTfpdaYJvDanutg8DpVur7rqDTg968QN_dT3coX7hB7SC=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "picnic",
                  "friends",
                  "lawn"
            ]
      },
      {
            "id": "berry-cute-picnic-24",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Board Game Battles (24)",
            "titleTa": "பலகை விளையாட்டு (24)",
            "captionEn": "Intense rounds of card games, Uno, and cultural trivia under the trees.",
            "captionTa": "மரங்களின் நிழலில் நடைபெற்ற சுவாரசியமான பலகை விளையாட்டுகள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczN8j2wwhk6wlIqhV0Yo9_E3LphYyrZOgijqQoLJTqRNW41uaj14TQQhzLLkRHc3uoRtuzdP5OfzoMcZko5aoEVxSoGTjvwpWUKBBr29kFva-YXM53nO=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "games",
                  "picnic",
                  "trivia"
            ]
      },
      {
            "id": "berry-cute-picnic-25",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Welcome to the Picnic (25)",
            "titleTa": "பிக்னிக் வரவேற்பு (25)",
            "captionEn": "Buckeyes gathering on the South Oval for the fall welcome picnic.",
            "captionTa": "இலையுதிர்கால பிக்னிக்கிற்காக ஓவல் புல்வெளியில் திரண்ட மாணவர்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPeqg4HHKSeVedafC33tUodLmjTZ686TATUgCZ3b3_LERHYmGdt9aMoeYKWKpXfheyXjsh6bIhmX02Alg3Y8q_LWNS-gydTMy2d-qAptCctWhStFQbs=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "picnic",
                  "oval",
                  "community",
                  "fall"
            ]
      },
      {
            "id": "berry-cute-picnic-26",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Fresh Berry Table (26)",
            "titleTa": "புதிய பழங்கள் அரங்கம் (26)",
            "captionEn": "Strawberries, blueberries, pastries, and refreshments prepared for attendees.",
            "captionTa": "ஸ்ட்ராபெர்ரி, ப்ளூபெர்ரி மற்றும் சுவையான சிற்றுண்டிகள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczNXt2_2x7-7j1BNEX59C5f3ma5AYDGPKC-8H05jN4CcBnYh4KSYZbsyq7LV7O8c2XGkCfkhyNlMUCMMG0XP6HAtz-gaZE5-lwQLa7MOOfaFlWHapyU0=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "food",
                  "picnic",
                  "sweets"
            ]
      },
      {
            "id": "berry-cute-picnic-27",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Lawn Games & Laughter (27)",
            "titleTa": "புல்வெளி விளையாட்டுகள் (27)",
            "captionEn": "Members competing in frisbee, badminton, and outdoor yard games.",
            "captionTa": "உறுப்பினர்கள் உற்சாகமாக விளையாடிய புல்வெளி விளையாட்டுகள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczOPBBwaZuDluuhtMtIBZMaG84njWHzMvPvDSIUmD9cRcPvz3uMN6TC8s8LzclLuxSc8OXoCWNmm1ZUclQ3fY7tjwQQnj4OK3vNP5icEnhkrB7BaNlre=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "games",
                  "picnic",
                  "lawn"
            ]
      },
      {
            "id": "berry-cute-picnic-28",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Campus Fellowship (28)",
            "titleTa": "தோழமை தருணம் (28)",
            "captionEn": "New freshmen connecting with upperclassmen and making lifelong friends.",
            "captionTa": "புதிய மற்றும் மூத்த மாணவர்கள் ஒன்றிணைந்து பழகிய இனிமையான நேரம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczOYxCblTi8hGl6M_Tjxxu3-DJXq16G3HhFg8AVCxXL7iynUOhqLjrT2VlYNzK0ODQ_ARkKJ1YKW-_Eala2Kk0nxY9DaM6g_xYuiwP20E7zbb-JJMOD3=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "community",
                  "bonding",
                  "friends"
            ]
      },
      {
            "id": "berry-cute-picnic-29",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Autumn Afternoon Sun (29)",
            "titleTa": "இலையுதிர் மாலை வெயில் (29)",
            "captionEn": "Enjoying the golden hour breeze across the central campus green.",
            "captionTa": "வளாகத்தின் பொன்மாலை வெயிலில் மாணவர்கள் ஓய்வு.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczNyUy9mSrk7FVMdfFhHBomQZuPmB4SHooqY_pLFJNEhvSLWxAhjbhW4R55G9PkTe9x5Mdpw-yVdcOnkdd1DA0MxToxg7ebuz7lJYRgI6ebNw3hMNmhH=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "nature",
                  "oval",
                  "fall"
            ]
      },
      {
            "id": "berry-cute-picnic-30",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Smiles & Selfies (30)",
            "titleTa": "மகிழ்ச்சி தருணங்கள் (30)",
            "captionEn": "Capturing candid polaroid and phone memories with the executive board.",
            "captionTa": "நிர்வாகக் குழுவினருடன் மாணவர்கள் எடுத்துக்கொண்ட புகைப்படங்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczOVCwIkODr5g5rBRpQ_swUYHb7_yqGHxeNAZ-45HzbbGFSmynpNAD4zYMZ6_w88da-ITLvqWC1JeIz_qfoXEbk6JdxfWB0-W3gBET1F3aOl_Z81EAfA=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "portraits",
                  "candid",
                  "friends"
            ]
      },
      {
            "id": "berry-cute-picnic-31",
            "albumSlug": "berry-cute-picnic",
            "titleEn": "Picnic Blanket Circles (31)",
            "titleTa": "பிக்னிக் வட்டங்கள் (31)",
            "captionEn": "Groups sitting on checkered blankets sharing stories and laughs.",
            "captionTa": "பாய்களில் வட்டமாக அமர்ந்து கதைகள் பேசிய மாணவர்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczMsYdU3Vtj1B4QkudOFasyjDhU1XV1Duy6OHziNgKnjFUkSLyucyxDHMyj1qpkBD-Voi_Ex2QXYgLj8GycKQuWrVIYv96Ju3CSyuM8ugVZtMtQDGP2h=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Sep 18, 2024",
            "tags": [
                  "picnic",
                  "friends",
                  "lawn"
            ]
      }
]
  },
  {
    slug: "streetside-sapad",
    titleEn: "TS Streetside Sapad Event",
    titleTa: "தெருவோரச் சாப்பாடு திருவிழா",
    eventSlug: "streetside-sapad",
    academicYear: "2018-2019",
    coverImage: "https://lh3.googleusercontent.com/pw/AP1GczMxKNKBGCOMDjAiZVwQ9oawnxmUPdX0DsEqbQrryf7fXP84JBPXMz_Oe4zM6Ze-w9lmIwkW7fj63L3Z-DX2KEWvlOIsXgCLc8rfTuZLPklMAp488qxt=w1200-h800-no",
    photoCount: 31,
    googlePhotosUrl: "https://photos.app.goo.gl/PnkceBh19PqytYQ89",
    descriptionEn: "Authentic South Indian streetside feast celebrating traditional street food culture — live kothu parotta, crispy dosas, filter kaapi, and fellowship.",
    descriptionTa: "கொத்து பரோட்டா, மொறுமொறு தோசை, நறுமண பில்டர் காபி மற்றும் மாணவர்கள் சங்கமித்த பாரம்பரிய தெருவோரச் சாப்பாடு திருவிழா.",
    photos: [
      {
            "id": "streetside-sapad-01",
            "albumSlug": "streetside-sapad",
            "titleEn": "Streetside Welcome",
            "titleTa": "தெருவோர வரவேற்பு",
            "captionEn": "Guests arriving at the authentic South Indian street food gala.",
            "captionTa": "பாரம்பரிய தெருவோர உணவு திருவிழாவிற்கு வருகை தந்த விருந்தினர்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczMxKNKBGCOMDjAiZVwQ9oawnxmUPdX0DsEqbQrryf7fXP84JBPXMz_Oe4zM6Ze-w9lmIwkW7fj63L3Z-DX2KEWvlOIsXgCLc8rfTuZLPklMAp488qxt=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "food",
                  "sapad",
                  "heritage"
            ]
      },
      {
            "id": "streetside-sapad-02",
            "albumSlug": "streetside-sapad",
            "titleEn": "Live Tawa Sizzle",
            "titleTa": "தவா சமையல் முழக்கம்",
            "captionEn": "The unmistakable sizzle and aroma of fresh kothu and crispy dosas.",
            "captionTa": "சுடச்சுட உருவான கொத்து பரோட்டா மற்றும் மொறுமொறு தோசை.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczNF_2udq2E6IEtC1s-XVUq1UlKrrxNA-C9qkOWeup2hGMg4_Ko3Q9ht3_c1lkPum7Lgba0THDhb1XA0xYowvs8HWdckVTnrjuYhVIir9-CRqrRwocXs=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "food",
                  "cooking",
                  "tawa"
            ]
      },
      {
            "id": "streetside-sapad-03",
            "albumSlug": "streetside-sapad",
            "titleEn": "Banana Leaf Service",
            "titleTa": "வாழை இலை பரிமாறுதல்",
            "captionEn": "Serving chutneys, sambar, and hot specialties on green banana leaves.",
            "captionTa": "வாழை இலையில் பாரம்பரிய சட்னி, சாம்பாருடன் கூடிய உணவு பரிமாறல்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczMd_Ca-bIl-USqHn_B4pu__WA4nAeb9pWcK56veZ3ojvKcEapqq5RkUOoqgjJAh7DCDzeGIDIh2zDdOlvSEuhj528GD2hsZKIzuAwP4gO91U7LUuKb3=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "food",
                  "tradition",
                  "feast"
            ]
      },
      {
            "id": "streetside-sapad-04",
            "albumSlug": "streetside-sapad",
            "titleEn": "Filter Kaapi & Chai",
            "titleTa": "பில்டர் காபி & டீ",
            "captionEn": "Frothy Madras filter coffee poured meter-style for hungry attendees.",
            "captionTa": "மணம் கமழும் கும்பகோணம் பில்டர் காபி மற்றும் சூடான தேநீர்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczOS1DyWkRKsH9a9VJBcm4AIlFlq0apv3fMKV5j5a7W-hOgu8XUFxrNt6v-SWQJBLnYSGIUex1N0c5fi3PmgamHi1X0HPTJGAacm5QpYaW74Xf1VD6K9=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "food",
                  "kaapi",
                  "tradition"
            ]
      },
      {
            "id": "streetside-sapad-05",
            "albumSlug": "streetside-sapad",
            "titleEn": "Community Dining",
            "titleTa": "ஒன்றாக உணவு உண்ணல்",
            "captionEn": "Students and alumni savoring authentic street delicacies together.",
            "captionTa": "மாணவர்களும் பழைய மாணவர்களும் ஒன்றாக அமர்ந்து சுவைத்த தருணம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczOmKTptM7M4u3fUgpGVtR2LyalrDDG1BmMjiFpjeJ0EQrtFNibrVCa9usBlRzgJ9OUxm1QtDxkkHPewneqYNfoUq2YU-5OiMnFLEFjpqliQdT-L1dBJ=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "community",
                  "feast",
                  "friends"
            ]
      },
      {
            "id": "streetside-sapad-06",
            "albumSlug": "streetside-sapad",
            "titleEn": "Culinary Volunteers",
            "titleTa": "சமையல் தன்னார்வலர்கள்",
            "captionEn": "Dedicated student chefs and volunteers working the serving stations.",
            "captionTa": "சுவையான உணவை பரிமாறிய மாணவர் தன்னார்வலர்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPJo1BUyFrCg7blN8_icy7X5b4E8WHp8RNh49Npt1hO8eMsQZlkGULUi_csah9r0P16Uc8R-KXtSSnZSF9AKH-e17YlP-A3XVeCE5XMApqaj9ePleeR=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "volunteers",
                  "team",
                  "kitchen"
            ]
      },
      {
            "id": "streetside-sapad-07",
            "albumSlug": "streetside-sapad",
            "titleEn": "Street Food Conversations",
            "titleTa": "சாப்பாட்டு உரையாடல்",
            "captionEn": "Bonding over spice levels, home recipes, and nostalgic hometown tastes.",
            "captionTa": "ஊர் நினைவுகளையும் பாட்டி கைமணத்தையும் பகிர்ந்து கொண்ட தருணம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczP5SWPE3pKQYrj2oUDrvNuN9iFxkCVUsHm83C-1yY7uEci8G0sSY7vgIbjSJUic4x5GMn5jvE2pXH6BZBjKHSwYXmjm1Z3PR_FWoU2f_g_1DfoR6aMU=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "conversation",
                  "culture",
                  "community"
            ]
      },
      {
            "id": "streetside-sapad-08",
            "albumSlug": "streetside-sapad",
            "titleEn": "Event Celebration",
            "titleTa": "திருவிழா கொண்டாட்டம்",
            "captionEn": "Commemorating another successful cultural culinary milestone at OSU.",
            "captionTa": "ஓஹியோ ஸ்டேட் வளாகத்தில் வெற்றிகரமாக நடந்த உணவுத் திருவிழா.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPOhReRIwl07PnI6b4Tpq7zLYmvAOXdhdXX8CG0E1O1wbk2HqqvdSJ2V_knIpziDXrohkSxyHGHZntiMTi4_hNqGwsiDbg5sWv5VRSj_YAbRHBzJL77=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "celebration",
                  "tradition",
                  "heritage"
            ]
      },
      {
            "id": "streetside-sapad-09",
            "albumSlug": "streetside-sapad",
            "titleEn": "Streetside Welcome (9)",
            "titleTa": "தெருவோர வரவேற்பு (9)",
            "captionEn": "Guests arriving at the authentic South Indian street food gala.",
            "captionTa": "பாரம்பரிய தெருவோர உணவு திருவிழாவிற்கு வருகை தந்த விருந்தினர்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPHANb9mYBTsrsNKQvJUOUwRln83Wbdwd6n1Uyz8Q1T9WFw1tqTO3VlKHWbjrpWy6i-QDuiXKQP9R7cJ3X8oJfzUXXy5X_1phmLAkGFOqLnRvUJd76O=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "food",
                  "sapad",
                  "heritage"
            ]
      },
      {
            "id": "streetside-sapad-10",
            "albumSlug": "streetside-sapad",
            "titleEn": "Live Tawa Sizzle (10)",
            "titleTa": "தவா சமையல் முழக்கம் (10)",
            "captionEn": "The unmistakable sizzle and aroma of fresh kothu and crispy dosas.",
            "captionTa": "சுடச்சுட உருவான கொத்து பரோட்டா மற்றும் மொறுமொறு தோசை.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczO7aOCMxff-k4NiSA8XwBxLq4ARF3VDyQXZZl70EAqcL890NiQfvqLUdK-yeOrOetB-jLd5n89HndpEe0EPHZVThq6IoAaiVq0nhqDMACTkpttCPjHL=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "food",
                  "cooking",
                  "tawa"
            ]
      },
      {
            "id": "streetside-sapad-11",
            "albumSlug": "streetside-sapad",
            "titleEn": "Banana Leaf Service (11)",
            "titleTa": "வாழை இலை பரிமாறுதல் (11)",
            "captionEn": "Serving chutneys, sambar, and hot specialties on green banana leaves.",
            "captionTa": "வாழை இலையில் பாரம்பரிய சட்னி, சாம்பாருடன் கூடிய உணவு பரிமாறல்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczNtyp_SfOh_wHDt6TONBL8GGrkMinysDTKve8wzpUHSuH8ljNOJ73skqv-gNjuWN8MMuX-CCSIPs6Eo9B--ikJUMzD21maE8fv2UVlvY0bhx5Cp0PXx=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "food",
                  "tradition",
                  "feast"
            ]
      },
      {
            "id": "streetside-sapad-12",
            "albumSlug": "streetside-sapad",
            "titleEn": "Filter Kaapi & Chai (12)",
            "titleTa": "பில்டர் காபி & டீ (12)",
            "captionEn": "Frothy Madras filter coffee poured meter-style for hungry attendees.",
            "captionTa": "மணம் கமழும் கும்பகோணம் பில்டர் காபி மற்றும் சூடான தேநீர்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczNYzpKFc3qATBW2L1s1Rb0OZO4YbknG9WSJOubdfsQcR6cg_jNu6G6xCLSFrlhmvspQlFsbZaGAEKzSH9Rgx_1RcaMV31_-i_ehFIFvL4FGNANLtvLN=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "food",
                  "kaapi",
                  "tradition"
            ]
      },
      {
            "id": "streetside-sapad-13",
            "albumSlug": "streetside-sapad",
            "titleEn": "Community Dining (13)",
            "titleTa": "ஒன்றாக உணவு உண்ணல் (13)",
            "captionEn": "Students and alumni savoring authentic street delicacies together.",
            "captionTa": "மாணவர்களும் பழைய மாணவர்களும் ஒன்றாக அமர்ந்து சுவைத்த தருணம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczNDlF_W1MV-4p4M2SQCPwLPgq7hULBSajIPM7-TogGSd2TotVto_fhkKjq6Mi2W9dDu7EF7jIdUq6RWEk4_WfCYIoejoun4onKf4l0oie08g0YXWmLS=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "community",
                  "feast",
                  "friends"
            ]
      },
      {
            "id": "streetside-sapad-14",
            "albumSlug": "streetside-sapad",
            "titleEn": "Culinary Volunteers (14)",
            "titleTa": "சமையல் தன்னார்வலர்கள் (14)",
            "captionEn": "Dedicated student chefs and volunteers working the serving stations.",
            "captionTa": "சுவையான உணவை பரிமாறிய மாணவர் தன்னார்வலர்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczNKcaVG7hX2RN0ZT2KB2yvN7fk-Cdip3Hzx24ukXP2EBE0j482DYbpv8y4Bb_isPAuFQXb_0b4KNlFUJOUEL8iu7mZhxeNvXAEDo-eHY3o-YORqntna=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "volunteers",
                  "team",
                  "kitchen"
            ]
      },
      {
            "id": "streetside-sapad-15",
            "albumSlug": "streetside-sapad",
            "titleEn": "Street Food Conversations (15)",
            "titleTa": "சாப்பாட்டு உரையாடல் (15)",
            "captionEn": "Bonding over spice levels, home recipes, and nostalgic hometown tastes.",
            "captionTa": "ஊர் நினைவுகளையும் பாட்டி கைமணத்தையும் பகிர்ந்து கொண்ட தருணம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczMOALUHEkQSnTpSokD0mCvh0--ImRS8ptfROhICVZ7h18dGcVeLD-bxY16hckAFMyfaQLj9TCw749QjtObMrepF_c1s77YxzQlRqnDCAbFKp_2B8C-O=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "conversation",
                  "culture",
                  "community"
            ]
      },
      {
            "id": "streetside-sapad-16",
            "albumSlug": "streetside-sapad",
            "titleEn": "Event Celebration (16)",
            "titleTa": "திருவிழா கொண்டாட்டம் (16)",
            "captionEn": "Commemorating another successful cultural culinary milestone at OSU.",
            "captionTa": "ஓஹியோ ஸ்டேட் வளாகத்தில் வெற்றிகரமாக நடந்த உணவுத் திருவிழா.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPRC7jPFMRk8DLZJYPo6hid2lNaMtqDHW5--ahMEh6eOqa2gPoD0TS6fVf7GikJT9D0ZmaugZq0ygb7TEDfvE_PkCOmYdYE_MZoV4yhbi_cSb81DVdb=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "celebration",
                  "tradition",
                  "heritage"
            ]
      },
      {
            "id": "streetside-sapad-17",
            "albumSlug": "streetside-sapad",
            "titleEn": "Streetside Welcome (17)",
            "titleTa": "தெருவோர வரவேற்பு (17)",
            "captionEn": "Guests arriving at the authentic South Indian street food gala.",
            "captionTa": "பாரம்பரிய தெருவோர உணவு திருவிழாவிற்கு வருகை தந்த விருந்தினர்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczOti0v0TkkMFOnsDvAtHfZRH5Fjl3NKpoZybUo8JY7k4_UTfkh5ULELdg3LIIq2DHz4o65vWgB1k_DTbJhCqR2o2LreYtS3cJ7MzMIjhKIR3pBNkO4e=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "food",
                  "sapad",
                  "heritage"
            ]
      },
      {
            "id": "streetside-sapad-18",
            "albumSlug": "streetside-sapad",
            "titleEn": "Live Tawa Sizzle (18)",
            "titleTa": "தவா சமையல் முழக்கம் (18)",
            "captionEn": "The unmistakable sizzle and aroma of fresh kothu and crispy dosas.",
            "captionTa": "சுடச்சுட உருவான கொத்து பரோட்டா மற்றும் மொறுமொறு தோசை.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczN2XARyABStq1tW8kmn0zL17BnzV-5mJeP5kYWLAP78GsySuLDdTrjAtUNOsasGDo-lbIZhtyAG0KdbSevfEMUYgjoca5YMCpgmEueu-TuxXZ5_-jf3=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "food",
                  "cooking",
                  "tawa"
            ]
      },
      {
            "id": "streetside-sapad-19",
            "albumSlug": "streetside-sapad",
            "titleEn": "Banana Leaf Service (19)",
            "titleTa": "வாழை இலை பரிமாறுதல் (19)",
            "captionEn": "Serving chutneys, sambar, and hot specialties on green banana leaves.",
            "captionTa": "வாழை இலையில் பாரம்பரிய சட்னி, சாம்பாருடன் கூடிய உணவு பரிமாறல்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPdlI03UedMWiPpWivjkM-OJvALqtokz4_b-29MPRzp3bkffjj-lnQ5xeqaTii2U3V5ic4GEoRuVN8oDKTdgEMG0fRIRoGVcnsk1GnPFeMpy6TzvAbK=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "food",
                  "tradition",
                  "feast"
            ]
      },
      {
            "id": "streetside-sapad-20",
            "albumSlug": "streetside-sapad",
            "titleEn": "Filter Kaapi & Chai (20)",
            "titleTa": "பில்டர் காபி & டீ (20)",
            "captionEn": "Frothy Madras filter coffee poured meter-style for hungry attendees.",
            "captionTa": "மணம் கமழும் கும்பகோணம் பில்டர் காபி மற்றும் சூடான தேநீர்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczOj9OzRAD8WW2mF39aKDG5xB8iMHrmxRW39quFL6QcfgtM8mXalmy_a9K33aCxtNmyvagsiG6puGryAz5J38HfpmwJNXGw_wQ5ZUkfo2wfetR7RWivQ=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "food",
                  "kaapi",
                  "tradition"
            ]
      },
      {
            "id": "streetside-sapad-21",
            "albumSlug": "streetside-sapad",
            "titleEn": "Community Dining (21)",
            "titleTa": "ஒன்றாக உணவு உண்ணல் (21)",
            "captionEn": "Students and alumni savoring authentic street delicacies together.",
            "captionTa": "மாணவர்களும் பழைய மாணவர்களும் ஒன்றாக அமர்ந்து சுவைத்த தருணம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczMr-2U9xUHQfcDX-IuXvlLS8ZNFjhdAnM4lXKFwg-qtZkeaACZhXa-aFogXeWuKUALEwm4YyWzk5iqTsEgSVpbH7epodoXdURklMnDqwkef3xDRcOoM=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "community",
                  "feast",
                  "friends"
            ]
      },
      {
            "id": "streetside-sapad-22",
            "albumSlug": "streetside-sapad",
            "titleEn": "Culinary Volunteers (22)",
            "titleTa": "சமையல் தன்னார்வலர்கள் (22)",
            "captionEn": "Dedicated student chefs and volunteers working the serving stations.",
            "captionTa": "சுவையான உணவை பரிமாறிய மாணவர் தன்னார்வலர்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczMfM1BLd-4KHtQSLwAhpUKC0EclwUAIGGvYfLol8wfH58rZb6XxkqocQh0YrliXXVa3PFpZP1Ym5ZMbZX9N9j9BP61umXA9ZlXL1AV_2wA9Gs-5l5bH=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "volunteers",
                  "team",
                  "kitchen"
            ]
      },
      {
            "id": "streetside-sapad-23",
            "albumSlug": "streetside-sapad",
            "titleEn": "Street Food Conversations (23)",
            "titleTa": "சாப்பாட்டு உரையாடல் (23)",
            "captionEn": "Bonding over spice levels, home recipes, and nostalgic hometown tastes.",
            "captionTa": "ஊர் நினைவுகளையும் பாட்டி கைமணத்தையும் பகிர்ந்து கொண்ட தருணம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczNRVxQwiCj8hIVl28L2LKxDQw5bpQ6vp3oq9qv3_sTQtxOvwniXLzL4Duk507txW9JDrvtHHRpCZVVKmLvqAJZvb5Gg55KvVj1mi__Ib1p1WBJYldxB=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "conversation",
                  "culture",
                  "community"
            ]
      },
      {
            "id": "streetside-sapad-24",
            "albumSlug": "streetside-sapad",
            "titleEn": "Event Celebration (24)",
            "titleTa": "திருவிழா கொண்டாட்டம் (24)",
            "captionEn": "Commemorating another successful cultural culinary milestone at OSU.",
            "captionTa": "ஓஹியோ ஸ்டேட் வளாகத்தில் வெற்றிகரமாக நடந்த உணவுத் திருவிழா.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPgH_HY0jjTPZKlmhcgJeTH6uLUtr3mzw_YYnFL8LgFWRXR5mqsk7lzl2TKnk1uuW-zRaoh1hKXr1bkLFCK6S1lxdJAMYUO5ObN_uh4kt4H_u5LE4_C=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "celebration",
                  "tradition",
                  "heritage"
            ]
      },
      {
            "id": "streetside-sapad-25",
            "albumSlug": "streetside-sapad",
            "titleEn": "Streetside Welcome (25)",
            "titleTa": "தெருவோர வரவேற்பு (25)",
            "captionEn": "Guests arriving at the authentic South Indian street food gala.",
            "captionTa": "பாரம்பரிய தெருவோர உணவு திருவிழாவிற்கு வருகை தந்த விருந்தினர்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPgkPt3Jahd7MUcw5AEzlHIpH3WQO8baHnxsHpE5WBEYUAgE6yNy3aO8sMr3j_SiYl6XwK81xvTyZJwQy-oJe4T5t2rCRGB4KBqVNTnw56CF3Cj8wca=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "food",
                  "sapad",
                  "heritage"
            ]
      },
      {
            "id": "streetside-sapad-26",
            "albumSlug": "streetside-sapad",
            "titleEn": "Live Tawa Sizzle (26)",
            "titleTa": "தவா சமையல் முழக்கம் (26)",
            "captionEn": "The unmistakable sizzle and aroma of fresh kothu and crispy dosas.",
            "captionTa": "சுடச்சுட உருவான கொத்து பரோட்டா மற்றும் மொறுமொறு தோசை.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczOntsOVF3Qxf1oS3Chke0LuTe4b_f4vE9Xf6TXgJZewxQ70vawCr4BO4yT5wfQh69degCXGRPb-ER6OFEyaArtTtuyAVgdVkJ4w2XeCbWzQ5Ho8odWz=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "food",
                  "cooking",
                  "tawa"
            ]
      },
      {
            "id": "streetside-sapad-27",
            "albumSlug": "streetside-sapad",
            "titleEn": "Banana Leaf Service (27)",
            "titleTa": "வாழை இலை பரிமாறுதல் (27)",
            "captionEn": "Serving chutneys, sambar, and hot specialties on green banana leaves.",
            "captionTa": "வாழை இலையில் பாரம்பரிய சட்னி, சாம்பாருடன் கூடிய உணவு பரிமாறல்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPmEGgr5CAUNrKj4cKr8tltDSgo--fnWadM2AZcT4apn8MKWa-JvpUwug0DdWt8cbmh2Q2Pu15jnvyuEPOh5BYchXv70N6Ps0DVhgnWJHYJlEzeIwAN=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "food",
                  "tradition",
                  "feast"
            ]
      },
      {
            "id": "streetside-sapad-28",
            "albumSlug": "streetside-sapad",
            "titleEn": "Filter Kaapi & Chai (28)",
            "titleTa": "பில்டர் காபி & டீ (28)",
            "captionEn": "Frothy Madras filter coffee poured meter-style for hungry attendees.",
            "captionTa": "மணம் கமழும் கும்பகோணம் பில்டர் காபி மற்றும் சூடான தேநீர்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczP27Y023B3iXMHXihryX0sLgIihNhCMJF4cDBzfK0WufIbCX8SZSP7RZFRTmEXgv6l6Bxu7SfLqW2FDQfIUNwigKImHv32xWcaRm4wJl9w2bAcAOQt-=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "food",
                  "kaapi",
                  "tradition"
            ]
      },
      {
            "id": "streetside-sapad-29",
            "albumSlug": "streetside-sapad",
            "titleEn": "Community Dining (29)",
            "titleTa": "ஒன்றாக உணவு உண்ணல் (29)",
            "captionEn": "Students and alumni savoring authentic street delicacies together.",
            "captionTa": "மாணவர்களும் பழைய மாணவர்களும் ஒன்றாக அமர்ந்து சுவைத்த தருணம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczNmIiSwbxtFGCyW0zCYJg7e3gUnsGpjHs_2gzvGwYDk1NSpXhNjEZDjKYoZfR5aH7mS4UjY137tZjecdghDyoLrwkZRMH6ScRveOxkRjVQYIta0YlmH=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "community",
                  "feast",
                  "friends"
            ]
      },
      {
            "id": "streetside-sapad-30",
            "albumSlug": "streetside-sapad",
            "titleEn": "Culinary Volunteers (30)",
            "titleTa": "சமையல் தன்னார்வலர்கள் (30)",
            "captionEn": "Dedicated student chefs and volunteers working the serving stations.",
            "captionTa": "சுவையான உணவை பரிமாறிய மாணவர் தன்னார்வலர்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczMS1pG7g62zTqjXRDOJb9ueJZYPv1-DSvhGkU2nxYDcxypeuvohtUoDUwbzD3Lccm3PVrYQJt5vrznxg976pIx966pBzikN_l0Ve3WYyp_xPts_sX1x=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "volunteers",
                  "team",
                  "kitchen"
            ]
      },
      {
            "id": "streetside-sapad-31",
            "albumSlug": "streetside-sapad",
            "titleEn": "Street Food Conversations (31)",
            "titleTa": "சாப்பாட்டு உரையாடல் (31)",
            "captionEn": "Bonding over spice levels, home recipes, and nostalgic hometown tastes.",
            "captionTa": "ஊர் நினைவுகளையும் பாட்டி கைமணத்தையும் பகிர்ந்து கொண்ட தருணம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPoDEE5ppMuBlStSn71wmY-vnb9sbDehdzKVvxu_QvEJZfJ8hGCig4Bkxoe8Rx8-xpnXzZA02iZ2EZid-qciQ4V85WQKl44j_Ed6YLD25GTunQbulMG=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Feb 27, 2019",
            "tags": [
                  "conversation",
                  "culture",
                  "community"
            ]
      }
]
  },
  {
    slug: "namma-jathara",
    titleEn: "TS x TT: Namma Jathara",
    titleTa: "நம்ம ஜாதரா (பண்பாட்டு சங்கமம்)",
    eventSlug: "namma-jathara",
    academicYear: "2018-2019",
    coverImage: "https://lh3.googleusercontent.com/pw/AP1GczMckOLKN2caITiN5K1TOGffHjjgJrfgVuOLzMp4vuZ6J7kgf1CQB-PChurpUnPfiexScEG44wZkP-PWanuwwdRE3STuUUNN6LLQoe-ioZJ3MeSMpkCC=w1200-h800-no",
    photoCount: 31,
    googlePhotosUrl: "https://photos.app.goo.gl/NBTxg98ppmd9uhWX9",
    descriptionEn: "Historic cultural carnival collaboration between OSU Tamil Sangam and Telugu Thallulu featuring folk dances, traditional games, regional cuisine, and collegiate solidarity.",
    descriptionTa: "ஓஹியோ ஸ்டேட் தமிழ் சங்கமும் தெலுங்கு தல்லுலு அமைப்பும் இணைந்து நடத்திய கண்கவர் 'நம்ம ஜாதரா' பண்பாட்டுத் திருவிழா.",
    photos: [
      {
            "id": "namma-jathara-01",
            "albumSlug": "namma-jathara",
            "titleEn": "Jathara Carnival Entry",
            "titleTa": "ஜாதரா திருவிழா நுழைவு",
            "captionEn": "Colorful streamers, festive decor, and cultural banners welcoming everyone.",
            "captionTa": "வண்ணத் தோரணங்கள் மற்றும் பாரம்பரிய அலங்காரங்களுடன் கூடிய நுழைவாயில்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczMckOLKN2caITiN5K1TOGffHjjgJrfgVuOLzMp4vuZ6J7kgf1CQB-PChurpUnPfiexScEG44wZkP-PWanuwwdRE3STuUUNN6LLQoe-ioZJ3MeSMpkCC=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "jathara",
                  "carnival",
                  "culture"
            ]
      },
      {
            "id": "namma-jathara-02",
            "albumSlug": "namma-jathara",
            "titleEn": "Joint Cultural Solidarity",
            "titleTa": "இரு பண்பாட்டு சங்கமம்",
            "captionEn": "OSU Tamil Sangam and Telugu Thallulu uniting for an energetic festival.",
            "captionTa": "தமிழ் சங்கமும் தெலுங்கு அமைப்பும் கைக்கோர்த்த வரலாற்றுத் தருணம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczNuEGeshSWnp89wHaHufx1Bd8MRDPNdjflHj-6aJQfCxsJ5Hoi8E1RE19B2swHesxufteDymvuxItgG44_D9JVLj-sgjpJoTdLgrtXWIXRxe7GFKrKo=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "collaboration",
                  "community",
                  "culture"
            ]
      },
      {
            "id": "namma-jathara-03",
            "albumSlug": "namma-jathara",
            "titleEn": "Rhythmic Folk Dance",
            "titleTa": "கிராமிய நடன சங்கமம்",
            "captionEn": "High-energy folk dances and cinematic mashups lighting up the floor.",
            "captionTa": "அரங்கையே அதிர வைத்த கிராமிய மற்றும் சினிமா நடனங்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPGCQshZV66CzrNL00kIbFhMoTNiDAXLKmvQlgnuxAzCXmdAW2A0Jq99RjQmqbh-6mOrDZ4cnwzhO_eMDcxxjImhw_KwqjF201SOKVLVymU7auvZMHY=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "dance",
                  "folk",
                  "carnival"
            ]
      },
      {
            "id": "namma-jathara-04",
            "albumSlug": "namma-jathara",
            "titleEn": "Carnival Games & Stalls",
            "titleTa": "திருவிழா விளையாட்டுகள்",
            "captionEn": "Traditional melas, ring toss, cultural quizzes, and friendly competitions.",
            "captionTa": "வளையம் எறிதல் மற்றும் பாரம்பரிய திருவிழா விளையாட்டு அரங்குகள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczNNKBxLuk6dKuVOB6Y3FJpMNzre-USTScoCoeK0Sc8C7ZUzrW7zWGaBTuxfNVfVIFvHkzqovHdJuhiJYSG-vheEmyJTlNLj8R_2H26_gJWog_za-V2p=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "games",
                  "carnival",
                  "fun"
            ]
      },
      {
            "id": "namma-jathara-05",
            "albumSlug": "namma-jathara",
            "titleEn": "Festive Attire & Silk",
            "titleTa": "பாரம்பரிய பட்டு ஆடைகள்",
            "captionEn": "Dazzling kurtas, sarees, and traditional attire illuminating the event.",
            "captionTa": "பட்டுப் புடவைகளும் குர்தாக்களும் மிளிர்ந்த விழா ஆடை அணிவகுப்பு.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczMSieqLN4zB-VkNLXZF2mGRrfnCcKscrn7OCTl6QWpmd2opp4kFpJDJ77pbumj5NTtQRlfaU4bqcN-4fN2tG3j3kkDbHUN4uxzKuvI4hJdC0OypqDPf=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "fashion",
                  "saree",
                  "traditional"
            ]
      },
      {
            "id": "namma-jathara-06",
            "albumSlug": "namma-jathara",
            "titleEn": "Music & Acoustic Jam",
            "titleTa": "இசை & பாடல் சங்கமம்",
            "captionEn": "Singers performing beloved classic hits in both Tamil and Telugu.",
            "captionTa": "தமிழ் மற்றும் தெலுங்குப் பாடல்களின் இனிமையான நேரடி இசை.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczN8O79fCki4kdMKwCfrppTwujasuheru0I8jaFsDAz256WeJqlVhlYZE0WeUu0j566viDlbNlD3Ily1WO-SiXEQaNsD8Ry5rfp0Mpm0oFfEhFNxYhfn=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "music",
                  "singing",
                  "performance"
            ]
      },
      {
            "id": "namma-jathara-07",
            "albumSlug": "namma-jathara",
            "titleEn": "Student Spirit & Cheers",
            "titleTa": "மாணவர் உற்சாகக் கூச்சல்",
            "captionEn": "A crowded room bursting with collegiate pride, cheers, and excitement.",
            "captionTa": "மாணவர்களின் ஆரவாரமும் கரவொலியும் நிறைந்த விழா அரங்கம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPREenBCML-8zZR0wrrf9-NYdmpoumuNSJrnZS90Y4fIyyRVGxdfTrsnZPPFlaFvMuQWOb_wBq6HbsopzsicCVEDm4nQBNRSUqTarhVqytEQ6k0GnAD=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "cheers",
                  "students",
                  "energy"
            ]
      },
      {
            "id": "namma-jathara-08",
            "albumSlug": "namma-jathara",
            "titleEn": "Grand Finale Group Photo",
            "titleTa": "இறுதி குழுப் புகைப்படம்",
            "captionEn": "Organizers, performers, and attendees coming together at the close of the carnival.",
            "captionTa": "ஒருங்கிணைப்பாளர்களும் மாணவர்களும் ஒன்றிணைந்த நிறைவு புகைப்படம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczOALweaQMhMZd_1Bb356039u2l02lgZQLHNsZTZ95eBgx0mBJBPclSREFrXaZ7HYouBLMwHVfYBchCwOuoQVFJ5qSaoyiyprspP-Qu4Wf273BJLH1l4=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "group",
                  "celebration",
                  "team"
            ]
      },
      {
            "id": "namma-jathara-09",
            "albumSlug": "namma-jathara",
            "titleEn": "Jathara Carnival Entry (9)",
            "titleTa": "ஜாதரா திருவிழா நுழைவு (9)",
            "captionEn": "Colorful streamers, festive decor, and cultural banners welcoming everyone.",
            "captionTa": "வண்ணத் தோரணங்கள் மற்றும் பாரம்பரிய அலங்காரங்களுடன் கூடிய நுழைவாயில்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczOYA5n7o_Gm6B7djdEykc2wKJoTVCLBlYpRt83MDu760bN1DQBmXX9Y4lQJ6LdlO94fta9vZBF_IbSCyamzuPV-ZmQwq5PT5m0BfN2yIqhbEYGaW3Lf=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "jathara",
                  "carnival",
                  "culture"
            ]
      },
      {
            "id": "namma-jathara-10",
            "albumSlug": "namma-jathara",
            "titleEn": "Joint Cultural Solidarity (10)",
            "titleTa": "இரு பண்பாட்டு சங்கமம் (10)",
            "captionEn": "OSU Tamil Sangam and Telugu Thallulu uniting for an energetic festival.",
            "captionTa": "தமிழ் சங்கமும் தெலுங்கு அமைப்பும் கைக்கோர்த்த வரலாற்றுத் தருணம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczOPUuZyNaSS825lgvrIa1Nyb5UMnjjUfzZUIvT7E-_AO3gmOpzvWEYeuoWQgn4oQCgQK8mkbPfjNKIpUqgXfiEOIWQpzt5eudP8t0hZ31FVe36oxSrc=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "collaboration",
                  "community",
                  "culture"
            ]
      },
      {
            "id": "namma-jathara-11",
            "albumSlug": "namma-jathara",
            "titleEn": "Rhythmic Folk Dance (11)",
            "titleTa": "கிராமிய நடன சங்கமம் (11)",
            "captionEn": "High-energy folk dances and cinematic mashups lighting up the floor.",
            "captionTa": "அரங்கையே அதிர வைத்த கிராமிய மற்றும் சினிமா நடனங்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczOgab5jhVZvFkLO-TD-Awwz1PD5_CBp5Xve4F2CiIqZVhetLp5Ww4GF9Tr9_-QjS3R21Ko_EJqEEbtcyYgOM8Rbg0ExVKWwodatIqwvos7-6HxVLQ0s=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "dance",
                  "folk",
                  "carnival"
            ]
      },
      {
            "id": "namma-jathara-12",
            "albumSlug": "namma-jathara",
            "titleEn": "Carnival Games & Stalls (12)",
            "titleTa": "திருவிழா விளையாட்டுகள் (12)",
            "captionEn": "Traditional melas, ring toss, cultural quizzes, and friendly competitions.",
            "captionTa": "வளையம் எறிதல் மற்றும் பாரம்பரிய திருவிழா விளையாட்டு அரங்குகள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPf9qeaTEOdLlkRneXzcNBHawAl3h_NUAOrURBFzhHouGToqXwV13QNnFkVy8_uCqWdnFZapEMrAS1-Qql5YzupgCT51NMlie0UY4vJ3YfZTauZbMU-=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "games",
                  "carnival",
                  "fun"
            ]
      },
      {
            "id": "namma-jathara-13",
            "albumSlug": "namma-jathara",
            "titleEn": "Festive Attire & Silk (13)",
            "titleTa": "பாரம்பரிய பட்டு ஆடைகள் (13)",
            "captionEn": "Dazzling kurtas, sarees, and traditional attire illuminating the event.",
            "captionTa": "பட்டுப் புடவைகளும் குர்தாக்களும் மிளிர்ந்த விழா ஆடை அணிவகுப்பு.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPMfM1GzrjT_ac8sjFS7_GPVKE1sKfRN08qtwuitAlWaoNcvFjLlTctCkcDojUEj0csKuPEDlQWWl-qGRuul9GHs_ip35EmsHl7uEQ0903EugukTdLn=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "fashion",
                  "saree",
                  "traditional"
            ]
      },
      {
            "id": "namma-jathara-14",
            "albumSlug": "namma-jathara",
            "titleEn": "Music & Acoustic Jam (14)",
            "titleTa": "இசை & பாடல் சங்கமம் (14)",
            "captionEn": "Singers performing beloved classic hits in both Tamil and Telugu.",
            "captionTa": "தமிழ் மற்றும் தெலுங்குப் பாடல்களின் இனிமையான நேரடி இசை.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczO1VQ8vzNxtGiq4V1XztTBUd4LUXFFBaMWV89x9nCdOZYlbU2APHjmORBwkYhvK6UtOMAMJwMwVfKW0Dd3m1A-sNXlaW652qvQJYKOBFToqAsaHwS6I=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "music",
                  "singing",
                  "performance"
            ]
      },
      {
            "id": "namma-jathara-15",
            "albumSlug": "namma-jathara",
            "titleEn": "Student Spirit & Cheers (15)",
            "titleTa": "மாணவர் உற்சாகக் கூச்சல் (15)",
            "captionEn": "A crowded room bursting with collegiate pride, cheers, and excitement.",
            "captionTa": "மாணவர்களின் ஆரவாரமும் கரவொலியும் நிறைந்த விழா அரங்கம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczMrDQBahMFOPxj28p9x-A7FCQKX78zS9uiMapg2IRdGichcZFxBCJ3FffRt9bT_PK7tE0Bu3RwLt4FhY6ucPS-yE7Z2pdIfc8IYxw2H45fTUNR09MU2=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "cheers",
                  "students",
                  "energy"
            ]
      },
      {
            "id": "namma-jathara-16",
            "albumSlug": "namma-jathara",
            "titleEn": "Grand Finale Group Photo (16)",
            "titleTa": "இறுதி குழுப் புகைப்படம் (16)",
            "captionEn": "Organizers, performers, and attendees coming together at the close of the carnival.",
            "captionTa": "ஒருங்கிணைப்பாளர்களும் மாணவர்களும் ஒன்றிணைந்த நிறைவு புகைப்படம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczMYYxtyj4czuaMJHAkN0Vr6rOUoXBwIzXiWHBbQOqAOG1obqL5xobJEktczeqdsknwvsS3BknaEeZiGumZRdGgMqL92rBvabNtaTsCFuPjCE9KiqBxY=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "group",
                  "celebration",
                  "team"
            ]
      },
      {
            "id": "namma-jathara-17",
            "albumSlug": "namma-jathara",
            "titleEn": "Jathara Carnival Entry (17)",
            "titleTa": "ஜாதரா திருவிழா நுழைவு (17)",
            "captionEn": "Colorful streamers, festive decor, and cultural banners welcoming everyone.",
            "captionTa": "வண்ணத் தோரணங்கள் மற்றும் பாரம்பரிய அலங்காரங்களுடன் கூடிய நுழைவாயில்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczNELc_g-M5pdj9rIM7OVM5FInjBZbZKUmvcr2YQqRYTAZeMZ6il_e-V5HG8iVeXZn735qR8-NwPFXmgGcIMPT3g6_6IjgNPyMZA8YIp3GkqzWqAdMIy=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "jathara",
                  "carnival",
                  "culture"
            ]
      },
      {
            "id": "namma-jathara-18",
            "albumSlug": "namma-jathara",
            "titleEn": "Joint Cultural Solidarity (18)",
            "titleTa": "இரு பண்பாட்டு சங்கமம் (18)",
            "captionEn": "OSU Tamil Sangam and Telugu Thallulu uniting for an energetic festival.",
            "captionTa": "தமிழ் சங்கமும் தெலுங்கு அமைப்பும் கைக்கோர்த்த வரலாற்றுத் தருணம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczO_3vSh6YwEjSpzaw97bqCoc5GzhYAy0clP_vLfeOqgezEafXtNIGisqq3YvRpNAUULChu2n5nZtOqJjPTZO3BLSB5eUXz4pj1qJWyCj8KkxTqZRgvN=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "collaboration",
                  "community",
                  "culture"
            ]
      },
      {
            "id": "namma-jathara-19",
            "albumSlug": "namma-jathara",
            "titleEn": "Rhythmic Folk Dance (19)",
            "titleTa": "கிராமிய நடன சங்கமம் (19)",
            "captionEn": "High-energy folk dances and cinematic mashups lighting up the floor.",
            "captionTa": "அரங்கையே அதிர வைத்த கிராமிய மற்றும் சினிமா நடனங்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPFYBeBKYzsA2b8fhiYFX2XXVsw9d0M-Aaoq5ZcRVjE5lzGOMHx8As6FBInxs3qyVUJhIUhdX0BzKiRMQMjjeOgi4I7Rh9xNe6Y-Y-K-Hx2fQLpk12m=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "dance",
                  "folk",
                  "carnival"
            ]
      },
      {
            "id": "namma-jathara-20",
            "albumSlug": "namma-jathara",
            "titleEn": "Carnival Games & Stalls (20)",
            "titleTa": "திருவிழா விளையாட்டுகள் (20)",
            "captionEn": "Traditional melas, ring toss, cultural quizzes, and friendly competitions.",
            "captionTa": "வளையம் எறிதல் மற்றும் பாரம்பரிய திருவிழா விளையாட்டு அரங்குகள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczOKa5idRozrPqsmMfgwVGSH8_op_uifLNMbQXzLlDQI0xug-y7gBpo74t9Wi9QrpW9N9TjBXp5H9B_rQ0V1GUEJvm4cVa29gyG7ifOGKDZBtPkDcZlR=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "games",
                  "carnival",
                  "fun"
            ]
      },
      {
            "id": "namma-jathara-21",
            "albumSlug": "namma-jathara",
            "titleEn": "Festive Attire & Silk (21)",
            "titleTa": "பாரம்பரிய பட்டு ஆடைகள் (21)",
            "captionEn": "Dazzling kurtas, sarees, and traditional attire illuminating the event.",
            "captionTa": "பட்டுப் புடவைகளும் குர்தாக்களும் மிளிர்ந்த விழா ஆடை அணிவகுப்பு.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczM5e5BOcs0Y8uzqFca-Gup19uEaaL3fOYxrMlsODUin1X5IB17Pt5V4oASFTzRanLSRgoaXH53Tyw5S9jMZ_tfwQdU6VeFQVocHbfWBhYMJVeP9mv7D=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "fashion",
                  "saree",
                  "traditional"
            ]
      },
      {
            "id": "namma-jathara-22",
            "albumSlug": "namma-jathara",
            "titleEn": "Music & Acoustic Jam (22)",
            "titleTa": "இசை & பாடல் சங்கமம் (22)",
            "captionEn": "Singers performing beloved classic hits in both Tamil and Telugu.",
            "captionTa": "தமிழ் மற்றும் தெலுங்குப் பாடல்களின் இனிமையான நேரடி இசை.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczNsGRtCufXvJOosXkuIIhhZFkeZ2vS9QDJwD7-tAw3PmJ3-D_U2UqXKcf9W3VsopzY1eopWi3GEerf1oF2aDSmY84uRFWZlEVzKXuNU4MRXvpePwL-c=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "music",
                  "singing",
                  "performance"
            ]
      },
      {
            "id": "namma-jathara-23",
            "albumSlug": "namma-jathara",
            "titleEn": "Student Spirit & Cheers (23)",
            "titleTa": "மாணவர் உற்சாகக் கூச்சல் (23)",
            "captionEn": "A crowded room bursting with collegiate pride, cheers, and excitement.",
            "captionTa": "மாணவர்களின் ஆரவாரமும் கரவொலியும் நிறைந்த விழா அரங்கம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPt4MViMYrnGdRZqcgBPIOAKDUxX4rtlXB1n_M2K37a6aBPUIiN9TcIsrvTtM1HNaZTyP1pir2zUOXoeCyucbbhKdHg3bPSE1PF1oUEJZduiknnA-K-=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "cheers",
                  "students",
                  "energy"
            ]
      },
      {
            "id": "namma-jathara-24",
            "albumSlug": "namma-jathara",
            "titleEn": "Grand Finale Group Photo (24)",
            "titleTa": "இறுதி குழுப் புகைப்படம் (24)",
            "captionEn": "Organizers, performers, and attendees coming together at the close of the carnival.",
            "captionTa": "ஒருங்கிணைப்பாளர்களும் மாணவர்களும் ஒன்றிணைந்த நிறைவு புகைப்படம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPPpcp0Nr5pSUq2sfBbzmTpGhROVr2HHNL138vr1B8ZypvqQQQTpBKF57VRd0PVoCOnx9DcJ2dO-NEcONb1DhTisdVCCgGRpMnMuTSp9MKFGLMctNmb=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "group",
                  "celebration",
                  "team"
            ]
      },
      {
            "id": "namma-jathara-25",
            "albumSlug": "namma-jathara",
            "titleEn": "Jathara Carnival Entry (25)",
            "titleTa": "ஜாதரா திருவிழா நுழைவு (25)",
            "captionEn": "Colorful streamers, festive decor, and cultural banners welcoming everyone.",
            "captionTa": "வண்ணத் தோரணங்கள் மற்றும் பாரம்பரிய அலங்காரங்களுடன் கூடிய நுழைவாயில்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczN2hrkZGBsz-V2SbbqWe9wv79xdbPuRAwfMud2mj0ROPy75ohiqTd4cjDqu0aSCQs-jQnKnlAMfikWWv2M-2eK-iQfbL8jOPCLTp-RaFjKBDg0X8xXj=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "jathara",
                  "carnival",
                  "culture"
            ]
      },
      {
            "id": "namma-jathara-26",
            "albumSlug": "namma-jathara",
            "titleEn": "Joint Cultural Solidarity (26)",
            "titleTa": "இரு பண்பாட்டு சங்கமம் (26)",
            "captionEn": "OSU Tamil Sangam and Telugu Thallulu uniting for an energetic festival.",
            "captionTa": "தமிழ் சங்கமும் தெலுங்கு அமைப்பும் கைக்கோர்த்த வரலாற்றுத் தருணம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczNlUShWYF33CtRpmX3DjYkzTrMabUYzClTudadwNwuo_1sW2AZR2I5Hpt4XGD--vt-1tbyGK5Lcn8ro1qqbpeyACJa59kxNMt2mS0HFnZsHaYe3JwF7=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "collaboration",
                  "community",
                  "culture"
            ]
      },
      {
            "id": "namma-jathara-27",
            "albumSlug": "namma-jathara",
            "titleEn": "Rhythmic Folk Dance (27)",
            "titleTa": "கிராமிய நடன சங்கமம் (27)",
            "captionEn": "High-energy folk dances and cinematic mashups lighting up the floor.",
            "captionTa": "அரங்கையே அதிர வைத்த கிராமிய மற்றும் சினிமா நடனங்கள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczO-LGkX1btFr8jw7K8_vueHA8D8X5YPx_hx6abeBGiZKk5xloHEOyNjlz9XXqZrRFHzoEQvNuUXvvjnWEtAuIZBpBWAHiusw45mkh96fqZSFrOAyWDA=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "dance",
                  "folk",
                  "carnival"
            ]
      },
      {
            "id": "namma-jathara-28",
            "albumSlug": "namma-jathara",
            "titleEn": "Carnival Games & Stalls (28)",
            "titleTa": "திருவிழா விளையாட்டுகள் (28)",
            "captionEn": "Traditional melas, ring toss, cultural quizzes, and friendly competitions.",
            "captionTa": "வளையம் எறிதல் மற்றும் பாரம்பரிய திருவிழா விளையாட்டு அரங்குகள்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczPSZ0YyyuPYVR26KbcP2MP2S4I4rkGPU7UfiFmYBBDyVz7aj7KHnxCetb_r9pO2BcgqS1o_2A7RNQOBmUZJirsjUmwbBwYWlUOcxqEkfa8Y5MrYsSV_=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "games",
                  "carnival",
                  "fun"
            ]
      },
      {
            "id": "namma-jathara-29",
            "albumSlug": "namma-jathara",
            "titleEn": "Festive Attire & Silk (29)",
            "titleTa": "பாரம்பரிய பட்டு ஆடைகள் (29)",
            "captionEn": "Dazzling kurtas, sarees, and traditional attire illuminating the event.",
            "captionTa": "பட்டுப் புடவைகளும் குர்தாக்களும் மிளிர்ந்த விழா ஆடை அணிவகுப்பு.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczO3n_OVQoOBCLU9MvG60agSCSgF7snlkcVY4Oe0Atzh_OIq3jevvpIbYO8C8_8mOgbiYyXEJAMCWnqf4Mz3Yc_XL8CfD3N6xJzR3DTXTHWCtBCvGF3b=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "fashion",
                  "saree",
                  "traditional"
            ]
      },
      {
            "id": "namma-jathara-30",
            "albumSlug": "namma-jathara",
            "titleEn": "Music & Acoustic Jam (30)",
            "titleTa": "இசை & பாடல் சங்கமம் (30)",
            "captionEn": "Singers performing beloved classic hits in both Tamil and Telugu.",
            "captionTa": "தமிழ் மற்றும் தெலுங்குப் பாடல்களின் இனிமையான நேரடி இசை.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczON5-ySva4hvpt9Fmj3M7HL8-6lL9qmp3n1kId1QAb3HBYeZfGRSdLVjCtCEl0SZYeD4yToK-eC2KxRtilAOxio4GxmGFaazOBaqqM2V99UXT7oyDTS=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "music",
                  "singing",
                  "performance"
            ]
      },
      {
            "id": "namma-jathara-31",
            "albumSlug": "namma-jathara",
            "titleEn": "Student Spirit & Cheers (31)",
            "titleTa": "மாணவர் உற்சாகக் கூச்சல் (31)",
            "captionEn": "A crowded room bursting with collegiate pride, cheers, and excitement.",
            "captionTa": "மாணவர்களின் ஆரவாரமும் கரவொலியும் நிறைந்த விழா அரங்கம்.",
            "imageUrl": "https://lh3.googleusercontent.com/pw/AP1GczNmtTxE0NLk_KGRX_i3FHACzDTFKDiEVdk824TD2pnwHliOH-Mioy3PizUCnFJRg_G33akBsxrCfEEcusNqsDaa7ls1hUGXyJRKhXI6zNP_fT_rynMm=w1200-h800-no",
            "photographer": "OSU Tamil Sangam Archives",
            "eventDate": "Mar 26, 2019",
            "tags": [
                  "cheers",
                  "students",
                  "energy"
            ]
      }
]
  },
  {
    slug: "pattas-tappas-2025",
    titleEn: "Pattas Tappas Diwali Celebration",
    titleTa: "பட்டாஸ் தப்பாஸ் தீபாவளி",
    eventSlug: "pattas-tappas-diwali-2026",
    academicYear: "2025-2026",
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    photoCount: 6,
    descriptionEn: "High-octane performances, colorful silk attire, live band solos, and sparklers at the Ohio Union.",
    descriptionTa: "வண்ண ஆடைகள், அதிரடி நடனங்கள் மற்றும் தீபாவளி விளக்குகள் நிறைந்த அழகிய தருணங்கள்.",
    photos: [
      {
        id: "pt-01",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Classical Fusion Dance",
        titleTa: "செவ்வியல் இணைவு நடனம்",
        captionEn: "Opening the evening with an evocative Bharatanatyam-contemporary fusion piece.",
        captionTa: "செவ்வியல் பரதநாட்டிய நடனத்துடன் தொடங்கிய வண்ணமயமான மாலை.",
        imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Nov 2025",
        tags: ["dance", "bharatanatyam", "lights", "stage"]
      },
      {
        id: "pt-02",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Sparkler Finale",
        titleTa: "மத்தாப்பு கொண்டாட்டம்",
        captionEn: "Students lighting sparklers on the Union South Plaza beneath the autumn sky.",
        captionTa: "தெற்கு பிளாசாவில் மாணவர்கள் இணைந்து ஏற்றிய தீபாவளி மத்தாப்புகள்.",
        imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Nov 2025",
        tags: ["sparklers", "fireworks", "diwali", "night"]
      },
      {
        id: "pt-03",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Live Fusion Band",
        titleTa: "நேரடி இசைக்குழு",
        captionEn: "Electrifying performance of classic Ilaiyaraaja and A.R. Rahman anthems.",
        captionTa: "இளையராஜா மற்றும் ஏ.ஆர்.ரஹ்மான் பாடல்களின் நேரடி இசை சங்கமம்.",
        imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80",
        photographer: "Campus Media",
        eventDate: "Nov 2025",
        tags: ["music", "concert", "band", "singers"]
      },
      {
        id: "pt-04",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Traditional Fashion Red Carpet",
        titleTa: "பாரம்பரிய ஆடை அணிவகுப்பு",
        captionEn: "Celebrating the sheer diversity of silk sarees, dhotis, and festive garments.",
        captionTa: "பட்டுச் சேலைகளும் வேஷ்டிகளும் மிளிர்ந்த ஆடை அணிவகுப்பு.",
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80",
        photographer: "Student Photographers",
        eventDate: "Nov 2025",
        tags: ["fashion", "saree", "veshti", "traditional"]
      },
      {
        id: "pt-05",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Grand Finale Group Dance",
        titleTa: "இறுதி பெரு நடனம்",
        captionEn: "Over thirty dancers joining hands on stage for the crowd-favorite Kuthu routine.",
        captionTa: "முப்பதுக்கும் மேற்பட்ட கலைஞர்கள் ஒன்றிணைந்த அதிரடி குத்து நடனம்.",
        imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Nov 2025",
        tags: ["dance", "kuthu", "gaana", "stage"]
      },
      {
        id: "pt-06",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Festive Feast Table",
        titleTa: "தீபாவளி அறுசுவை விருந்து",
        captionEn: "Crisp murukku, sweet adhirasam, and steaming biryani shared together.",
        captionTa: "முறுக்கு, அதிரசம், பிரியாணி என நாவில் நீர் ஊற வைக்கும் விருந்து.",
        imageUrl: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=1000&q=80",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Nov 2025",
        tags: ["food", "feast", "sweets", "biryani"]
      }
    ]
  }
];
