/* Manifest-driven Headies media galleries. */
(function(){
  'use strict';

  var GALLERY_URL='data/gallery-items.json';
  var VIDEO_URL='data/video-sources.json';

  var FEATURED=[
    {id:'1aHJNMfsUsfGevnnBwO_2db4xZ3BF69dt',title:'The 2025 stage in full colour',tag:'Stage',tile:'wide'},
    {id:'1QD_gCNxfqKWiivSlV1TP5ygXeO5JvlMs',title:'Red carpet arrival',tag:'Red Carpet',tile:'tall'},
    {id:'1NB7ILC4qrkDB9qgfK5pWhV-oBth13GA_',title:'A culture-forward performance moment',tag:'Performance'},
    {id:'1Qn8LsXU7y6IPmF1500WyiW7iyGI4gtUD',title:'Audience energy',tag:'Audience'},
    {id:'12XWcAr147qwIeeXXRiIQGcZJpdE3iq5f',title:'Creative Conference',tag:'Conference'},
    {id:'1BH8mrwAnxN7HyfXl6bV4yBjCON6gVbed',title:'Ambience and brand presence',tag:'Brands'},
    {id:'1HsW-fJzvxJ9Xameh9lEWveMZrWGSUlpz',title:'US Consulate main event',tag:'Partners',tile:'wide'}
  ];

  var HOME_SECTIONS=[
    {
      eyebrow:'Awards Night',
      title:'Stage, audience and ceremony',
      copy:'The headline night, from the stage build and performances to the crowd energy that makes The Headies feel alive.',
      collections:['headies-awards-2025--stage','headies-awards-2025--audience-and-interactions','headies-awards-2025--ambience-and-brands'],
      limit:4
    },
    {
      eyebrow:'Creative Events',
      title:'Conference and industry moments',
      copy:'Panels, conversations and creator gatherings that frame The Headies as more than an awards show.',
      collections:['creative-conference-day-1','creative-conference-day-2'],
      limit:4
    },
    {
      eyebrow:'Red Carpet',
      title:'Arrivals, style and spotlight',
      copy:'Fashion, interviews and arrival moments across the newest Headies red-carpet collections.',
      collections:['headies-awards-2025--red-carpet','headies-us-consulate-2023--red-carpet--folder-1'],
      limit:4
    },
    {
      eyebrow:'Partnerships + Culture',
      title:'Brands, consulate and cultural presentation',
      copy:'Proof of the platform around the music: partner activations, institutional moments and cultural showcases.',
      collections:['headies-us-consulate-2025-a','headies-us-consulate-2023--brands','headies-us-consulate-2023--cultural-presentation','headies-us-consulate-2023--main-event--folder-1'],
      limit:4
    }
  ];

  var COLLECTIONS=[
    {id:'all',label:'All'},
    {id:'headies-awards-2025--stage',label:'Stage'},
    {id:'headies-awards-2025--red-carpet',label:'Red Carpet'},
    {id:'headies-awards-2025--audience-and-interactions',label:'Audience'},
    {id:'headies-awards-2025--ambience-and-brands',label:'Brands'},
    {id:'creative-conference-day-1',label:'Conference Day 1'},
    {id:'creative-conference-day-2',label:'Conference Day 2'},
    {id:'headies-us-consulate-2025-a',label:'US Consulate 2025'},
    {id:'headies-us-consulate-2023--brands',label:'Brands 2023'},
    {id:'headies-us-consulate-2023--cultural-presentation',label:'Culture'},
    {id:'headies-us-consulate-2023--main-event--folder-1',label:'US Consulate Main Event'},
    {id:'headies-us-consulate-2023--red-carpet--folder-1',label:'US Consulate Red Carpet'}
  ];

  var COLLECTION_META={
    'headies-awards-2025--stage':{tag:'Awards 2025 / Stage',title:'Awards stage moment'},
    'headies-awards-2025--red-carpet':{tag:'Awards 2025 / Red Carpet',title:'Red carpet arrivals'},
    'headies-awards-2025--audience-and-interactions':{tag:'Awards 2025 / Audience',title:'Audience reaction'},
    'headies-awards-2025--ambience-and-brands':{tag:'Awards 2025 / Ambience',title:'Venue ambience'},
    'creative-conference-day-1':{tag:'Creative Conference / Day 1',title:'Conference day-one moment'},
    'creative-conference-day-2':{tag:'Creative Conference / Day 2',title:'Conference day-two moment'},
    'headies-us-consulate-2025-a':{tag:'US Consulate 2025 / Partners',title:'Partner activation'},
    'headies-us-consulate-2023--brands':{tag:'US Consulate 2023 / Brands',title:'Brand activation'},
    'headies-us-consulate-2023--cultural-presentation':{tag:'US Consulate 2023 / Culture',title:'Cultural showcase'},
    'headies-us-consulate-2023--main-event--folder-1':{tag:'US Consulate 2023 / Main Event',title:'Main event moment'},
    'headies-us-consulate-2023--red-carpet--folder-1':{tag:'US Consulate 2023 / Red Carpet',title:'Red carpet reception'}
  };

  function loadJson(url){
    return fetch(url,{cache:'no-store'}).then(function(res){
      if(!res.ok)throw new Error('Could not load '+url);
      return res.json();
    });
  }

  function esc(value){
    return String(value==null?'':value).replace(/[&<>"']/g,function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }

  function byId(items){
    return items.reduce(function(map,item){map[item.driveFileId]=item;return map;},{});
  }

  function annotateItems(items){
    var counts={};
    items.forEach(function(item){
      var key=item.collection||'archive';
      counts[key]=(counts[key]||0)+1;
      item.displayIndex=counts[key];
    });
    return items;
  }

  function cleanCollectionTitle(value){
    value=String(value||'Archive')
      .replace(/^Headies\s+/i,'')
      .replace(/^Awards\s+2025\s*\/\s*/i,'Awards 2025 / ')
      .replace(/^x\s+US\s+Consulate/i,'US Consulate')
      .replace(/^x\s+/i,'')
      .replace(/\s*\/\s*FOLDER\s+\d+/ig,'')
      .replace(/\s*-\s*Folder\s+[A-Z]/ig,'')
      .replace(/\s+/g,' ')
      .trim();
    return value||'Archive';
  }

  function metaFor(item){
    if(item && COLLECTION_META[item.collection])return COLLECTION_META[item.collection];
    var tag=cleanCollectionTitle(item&&item.collectionTitle);
    return {tag:tag,title:tag.replace(/\s*\/\s*/g,' ').replace(/\b\d{4}\b/g,'').trim()+' moment'};
  }

  function padIndex(value){
    value=parseInt(value,10)||1;
    return String(value).padStart(2,'0');
  }

  function displayTitle(item, index){
    var meta=metaFor(item);
    return meta.title+' '+padIndex(item.displayIndex||index+1);
  }

  function displayTag(item){
    return metaFor(item).tag;
  }

  function card(item, cfg, index){
    cfg=cfg||{};
    var title=cfg.title||displayTitle(item,index);
    var tag=cfg.tag||displayTag(item);
    var tile=cfg.tile||'';
    return '<div class="gtile drive-card '+esc(tile)+'" data-lb="'+esc(title)+'" data-full-src="'+esc(item.fullUrl||item.imageUrl)+'">'+
      '<img class="media-img" loading="'+(index<8?'eager':'lazy')+'" src="'+esc(item.imageUrl||item.thumbUrl)+'" alt="'+esc(title)+'">'+
      '<div class="drive-card__shade"></div>'+
      '<div class="drive-card__body"><div class="drive-card__tag">'+esc(tag)+'</div><div class="drive-card__title">'+esc(title)+'</div></div>'+
    '</div>';
  }

  function archiveCard(item, index){
    var title=displayTitle(item,index);
    var tag=displayTag(item);
    return '<article class="drive-card" data-lb="'+esc(title)+'" data-full-src="'+esc(item.fullUrl||item.imageUrl)+'">'+
      '<img class="media-img" loading="'+(index<12?'eager':'lazy')+'" src="'+esc(item.thumbUrl||item.imageUrl)+'" alt="'+esc(title)+'">'+
      '<div class="drive-card__shade"></div>'+
      '<div class="drive-card__body"><div class="drive-card__tag">'+esc(tag)+'</div><div class="drive-card__title">'+esc(title)+'</div>'+
      '<div class="drive-card__meta">'+esc(item.year||'Archive')+'</div></div>'+
    '</article>';
  }

  function shortCollection(value){
    return cleanCollectionTitle(value)
      .replace('Headies Awards 2025 / ','Awards 2025 / ')
      .replace('Headies Creative Conference - ','Creative Conference / ');
  }

  function refreshLightbox(){
    if(window.HeadiesLightbox && typeof window.HeadiesLightbox.refresh==='function')window.HeadiesLightbox.refresh();
  }

  function renderHome(items){
    document.querySelectorAll('[data-gallery="home"]').forEach(function(root){
      var map=byId(items);
      var html=FEATURED.map(function(cfg,i){
        var item=map[cfg.id];
        return item?card(item,cfg,i):'';
      }).join('');
      root.innerHTML=html || '<div class="gallery-status">Gallery assets are being refreshed.</div>';
      refreshLightbox();
    });
  }

  function sampleByCollections(items, collections, limit){
    var selected=[];
    collections.forEach(function(collection){
      var found=items.filter(function(item){return item.type==='image' && item.collection===collection;});
      if(found.length)selected.push(found[Math.min(selected.length,found.length-1)]);
    });
    if(selected.length<limit){
      collections.forEach(function(collection){
        items.forEach(function(item){
          if(selected.length>=limit)return;
          if(item.type==='image' && item.collection===collection && selected.indexOf(item)===-1)selected.push(item);
        });
      });
    }
    return selected.slice(0,limit);
  }

  function renderHomeSections(items){
    document.querySelectorAll('[data-gallery="home-sections"]').forEach(function(root){
      root.innerHTML=HOME_SECTIONS.map(function(section){
        var cards=sampleByCollections(items,section.collections,section.limit).map(function(item,i){
          return archiveCard(item,i);
        }).join('');
        if(!cards)return '';
        return '<section class="collection-band">'+
          '<div class="collection-band__head"><div><div class="collection-band__k">'+esc(section.eyebrow)+'</div>'+
          '<h3 class="collection-band__title">'+esc(section.title)+'</h3></div>'+
          '<p class="collection-band__copy">'+esc(section.copy)+'</p></div>'+
          '<div class="collection-row">'+cards+'</div></section>';
      }).join('');
      refreshLightbox();
    });
  }

  function renderCollectionHighlights(items){
    document.querySelectorAll('[data-gallery="collection-highlights"]').forEach(function(root){
      var html=COLLECTIONS.filter(function(group){return group.id!=='all';}).map(function(group){
        var count=items.filter(function(item){return item.type==='image' && item.collection===group.id;}).length;
        if(!count)return '';
        return '<button class="collection-card" type="button" data-highlight-filter="'+esc(group.id)+'">'+
          '<span class="collection-card__count">'+esc(count)+'</span>'+
          '<span><span class="collection-card__title">'+esc(group.label)+'</span>'+
          '<span class="collection-card__meta">Open collection</span></span></button>';
      }).join('');
      root.innerHTML=html;
      root.addEventListener('click',function(e){
        var card=e.target.closest('[data-highlight-filter]');
        if(!card)return;
        var filter=document.querySelector('[data-filter="'+card.getAttribute('data-highlight-filter')+'"]');
        if(filter)filter.click();
        var photos=document.getElementById('photos');
        if(photos)photos.scrollIntoView({behavior:'smooth'});
      });
    });
  }

  function renderArchive(items){
    document.querySelectorAll('[data-gallery="archive"]').forEach(function(root){
      var filters=document.querySelector('[data-gallery-filters]');
      var status=document.querySelector('[data-gallery-count]');
      var loadMore=document.querySelector('[data-gallery-more]');
      var active='all';
      var visible=36;
      var filtered=[];

      function apply(){
        filtered=items.filter(function(item){
          return item.type==='image' && (active==='all' || item.collection===active);
        });
        root.innerHTML=filtered.slice(0,visible).map(archiveCard).join('');
        if(status)status.textContent=filtered.length+' photos available';
        if(loadMore)loadMore.style.display=visible<filtered.length?'inline-flex':'none';
        refreshLightbox();
      }

      if(filters){
        filters.innerHTML=COLLECTIONS.map(function(group,i){
          return '<button class="gallery-filter__btn '+(i===0?'active':'')+'" type="button" data-filter="'+esc(group.id)+'">'+esc(group.label)+'</button>';
        }).join('');
        filters.addEventListener('click',function(e){
          var btn=e.target.closest('[data-filter]');
          if(!btn)return;
          active=btn.getAttribute('data-filter');
          visible=36;
          filters.querySelectorAll('.gallery-filter__btn').forEach(function(x){x.classList.toggle('active',x===btn);});
          apply();
        });
      }
      if(loadMore){
        loadMore.addEventListener('click',function(){visible+=36;apply();});
      }
      apply();
    });
  }

  function renderSources(summary){
    document.querySelectorAll('[data-gallery="sources"]').forEach(function(root){
      var folders=(summary.folders||[]).filter(function(folder){return folder.entriesFound>0;}).slice(0,9);
      root.innerHTML=folders.map(function(folder){
        return '<article class="source-card"><div class="source-card__k">'+esc(folder.entriesFound)+' records</div>'+
          '<div class="source-card__t">'+esc(folder.title)+'</div>'+
          '<div class="source-card__m">Folder ID: '+esc(folder.folderId)+'</div></article>';
      }).join('');
    });
  }

  function thumbForVideo(video){
    return 'https://img.youtube.com/vi/'+video.youtubeId+'/hqdefault.jpg';
  }

  function embedForVideo(video){
    return 'https://www.youtube.com/embed/'+video.youtubeId+'?autoplay=1&rel=0';
  }

  function watchForVideo(video){
    return 'https://www.youtube.com/watch?v='+video.youtubeId;
  }

  function renderVideos(videos){
    document.querySelectorAll('[data-video-gallery]').forEach(function(root){
      var mode=root.getAttribute('data-video-gallery');
      var selected=videos.slice(0,mode==='home'?4:8);
      if(!selected.length){
        root.innerHTML='<div class="gallery-status">Video archive is being refreshed.</div>';
        return;
      }
      var main=selected[0];
      var side=selected.slice(1,4);
      var mainHtml='<div class="videofeat__main" data-lb="'+esc(main.title)+'" data-video-url="'+esc(embedForVideo(main))+'" data-video-watch="'+esc(watchForVideo(main))+'">'+
        '<img class="media-img" src="'+esc(thumbForVideo(main))+'" alt="'+esc(main.title)+'">'+
        '<div class="legend__grad"></div><div class="play-btn"><span><i data-lucide="play" class="icon"></i></span></div>'+
        '<div style="position:absolute;left:24px;bottom:22px;z-index:3"><div class="card__tag">'+esc(main.tag)+'</div>'+
        '<div style="font-family:var(--font-display);font-weight:650;font-size:1.5rem;max-width:24ch">'+esc(main.title)+'</div></div></div>';
      var sideHtml=side.map(function(video){
        return '<div class="vrow" data-lb="'+esc(video.title)+'" data-video-url="'+esc(embedForVideo(video))+'" data-video-watch="'+esc(watchForVideo(video))+'">'+
          '<div class="vrow__thumb"><img class="media-img" loading="lazy" src="'+esc(thumbForVideo(video))+'" alt="'+esc(video.title)+'">'+
          '<div class="play-btn"><span style="width:42px;height:42px"><i data-lucide="play" class="icon" style="width:16px"></i></span></div></div>'+
          '<div class="vrow__t">'+esc(video.title)+'</div></div>';
      }).join('');
      var moreHtml='';
      if(mode!=='home' && selected.length>4){
        moreHtml='<div class="grid grid-4" style="margin-top:24px">'+selected.slice(4).map(function(video){
          return '<article class="card" data-lb="'+esc(video.title)+'" data-video-url="'+esc(embedForVideo(video))+'" data-video-watch="'+esc(watchForVideo(video))+'">'+
            '<div class="card__media"><img class="media-img" loading="lazy" src="'+esc(thumbForVideo(video))+'" alt="'+esc(video.title)+'">'+
            '<div class="play-btn"><span style="width:52px;height:52px"><i data-lucide="play" class="icon" style="width:20px"></i></span></div></div>'+
            '<div class="card__body"><span class="card__tag">'+esc(video.tag)+'</span><h3 class="card__title">'+esc(video.title)+'</h3></div></article>';
        }).join('')+'</div>';
      }
      root.innerHTML='<div class="videofeat">'+mainHtml+'<div class="videofeat__side">'+sideHtml+'</div></div>'+moreHtml;
      if(window.lucide)window.lucide.createIcons();
      refreshLightbox();
    });
  }

  function boot(){
    Promise.all([
      loadJson(GALLERY_URL).catch(function(){return {items:[]};}),
      loadJson('data/gallery-inventory-summary.json').catch(function(){return {folders:[]};}),
      loadJson(VIDEO_URL).catch(function(){return {videos:[]};})
    ]).then(function(results){
      var items=annotateItems(results[0].items||[]);
      renderHome(items);
      renderHomeSections(items);
      renderCollectionHighlights(items);
      renderArchive(items);
      renderSources(results[1]);
      renderVideos(results[2].videos||[]);
    }).catch(function(err){
      document.querySelectorAll('[data-gallery]').forEach(function(root){
        root.innerHTML='<div class="gallery-status">'+esc(err.message||err)+'</div>';
      });
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
