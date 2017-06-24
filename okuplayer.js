
var scripts = document.getElementsByTagName("script");
var okuPath = scripts[scripts.length-1].src.replace(/\/[^\/]+$/, "/");
console.log('OKUPATH', okuPath);
var OkuPlayer = function (config) {
    var okuPlayerInstance = this;
	this.readyState = 0;
	this.continuous = true;
	this.autoscroll = true;
	this.pagedView = true;
	this.fontSize = 3;

    this.startFrom = -1;
    this.fragmentClassName = "fragm";
	window.self !== window.top ? this.embedded = true : this.embedded = false ;

    this.okuPath = okuPath;
	
	this.visibleFragments = [];
	this.seekBuffer = 0;
	var pointerC;
	var ua = navigator.userAgent;
	navigator.userAgent.indexOf("mobi")>=0 ? this.mobile = true : this.mobile = false; 
	var iOS = ua.match(/iPad/) || ua.match(/iPhone/)|| ua.match(/iPod/);
	var webkit = ua.match(/WebKit/);
	var android = ua.match(/Android/);
	var windows = ua.match(/Windows/);
	var linux = ua.match(/Linux/);
	var osx = ua.match(/Macintosh/);
	if(iOS) {
		if(webkit && ua.match(/CriOS/)){
			this.browser = "ios_safari";
		}
		else if(webkit && ua.match(/FxiOS/i)){
			this.browser = "ios_safari";
		}
		else if(webkit && ua.match(/OPiOS/)){
			this.browser = "ios_opera";
		}
		else if(ua.match(/UCBrowser/)){
			this.browser = "ios_ucbrowser";
		}
		else if(webkit && ua.match(/Safari/)){
			this.browser = "ios_safari";
		}
		else if(webkit){
			this.browser = "ios_safariwebview";
		}
		else {
			this.browser = "ios_unknown";
		}
	}
	else if(android){
		if(ua.match(/Firefox/)){
			this.browser = "android_firefox";
		}
		else if(ua.match(/UCBrowser/)){
			this.browser = "android_ucbrowser";
		}		
		else if(webkit && ua.match(/OPR/)){
			this.browser = "android_opera";
		}
		else if(webkit && ua.match(/Version/)){
			this.browser = "android_native";
		}
		else if(webkit && ua.match(/Chrome/)){
			this.browser = "android_chrome";
		}
		else {
			this.browser = "android_unknown";
		}
	}
	else if(linux){
		if(ua.match(/Firefox/)){
			this.browser = "linux_firefox";
		}
		else if(webkit && ua.match(/Chrome/)){
			this.browser = "linux_chrome";
		}		
		else {
			this.browser = "linux_unknown";
		}
	}
	else if(osx){
		if(ua.match(/Firefox/)){
			this.browser = "osx_firefox";
		}
		else if(webkit && ua.match(/Chrome/)){
			this.browser = "osx_chrome";
		}
		else if(webkit && ua.match(/Safari/)){
			this.browser = "osx_safari";
		}	
		else {
			this.browser = "osx_unknown";
		}
	}
	else if(windows){
		if(ua.match(/Firefox/)){
			this.browser = "windows_firefox";
		}
		else if(ua.match(/UCBrowser/)){
			this.browser = "windows_ucbrowser";
		}		
		else if(ua.match(/Edge/)){
			this.browser = "windows_edge";
		}
		else if(ua.match(/Trident/)){
			this.browser = "windows_ie";
		}
		else if(webkit && ua.match(/Chrome/i)){
			this.browser = "windows_chrome";
		}
		else {
			this.browser = "windows_unknown";
		}
	}
	else {
		if(ua.match(/Firefox/)){
			this.browser = "unknown_firefox";
		}
		else if(ua.match(/UCBrowser/)){
			this.browser = "unknown_ucbrowser";
		}		
		else if(webkit && ua.match(/OPR/)){
			this.browser = "unknown_opera";
		}
		else if(webkit && ua.match(/Version/)){
			this.browser = "unknown_native";
		}
		else if(webkit && ua.match(/Chrome/)){
			this.browser = "unknown_chrome";
		}
		else {
			this.browser = "unknown_unknown";
		}	
	}
	
	
	console.log("this.browser: ", this.browser);
	console.log(this.browser);
		var consoleDiv = document.createElement("pre");
		// document.body.appendChild(consoleDiv);	

	function hConsole(text){
		consoleDiv.innerHTML += "\n";
		for(i=0; i<arguments.length; i++){
			consoleDiv.innerHTML += "\t" + arguments[i];
		}
	}
	// console.log = hConsole;
	// hConsole(this.browser);
	this.container = document.querySelector("#oku-container");
	var innerFrame = document.createElement('iframe');
	this.container.appendChild(innerFrame);
	this.innerFrame = innerFrame;
	// this.container.style.border = "1px solid lightgray";
	this.container.style.border = "none";
	// this.container.style.padding = "1px";
	window.scrollBy(0,1);
	this.xhtmlPath = config.xhtmlPath;
	this.syncmapPath = config.syncmapPath;
	console.log(this.xhtmlPath, this.syncmapPath);
	this.audioPaths = config.audioPaths;
	
	if(config.settings) {
		this.settings = config.settings;
		if(this.settings.continuous == false) this.continuous = false;
		if(this.settings.autoscroll == false) this.autoscroll = false;
		if(this.settings.pagedView == false) this.pagedView = false;
        if(this.settings.startFrom) this.startFrom = parseInt(this.settings.startFrom);
        if(this.settings.fragmentClassName) this.fragmentClassName = this.settings.fragmentClassName;
        if(this.settings.translation) this.translation = this.settings.translation;
        console.log(this.settings.translation, this.translation)
	}
    this.checkHash = function(){
        console.log('checking hash');
        if(startFromHash = window.location.hash.match(/OkuStart([0-9]*)/)) {
            console.log(startFromHash);
            this.startFrom = parseInt(startFromHash[1]);
        }
    }
    this.checkHashChange = function(){
        console.log('checking hash change');
        if(startFromHash = window.location.hash.match(/OkuStart([0-9]*)/)) {
            console.log(startFromHash);
            if(this.readyState && parseInt(startFromHash[1]) < this.fragments.length) {
                this.startFrom = parseInt(startFromHash[1]);
                this.playFragment(this.startFrom);
                this.scroll();
            }
        }

    }    
	window.addEventListener('hashchange', this.checkHashChange.bind(this));
    this.checkHash();
    
    if(config.meta)this.meta = config.meta;
	
	this.introDiv = '<div id="intro-div">';
	if(this.meta) {
		if(this.meta.book) {this.introDiv += '<h1 id="book-title"><span>' + this.meta.book + '</span></h1>';
			this.meta.author ? this.introDiv += '<h3 id="author"><span><i>by </i><br><b>' + this.meta.author + '</b></span></h3>' : "";
			this.meta.chapter ? this.introDiv += '<h1  id="chapter-title"><span>' + this.meta.chapter + '</span></h1>': "";
			!this.meta.author && this.meta.chapterAuthor ? this.introDiv += '<h4  id="author"><span><i>by </i><br><b>' + this.meta.chapterAuthor + '</b></span></h4>' : "";
		}else{
			this.meta.chapter ? this.introDiv += '<h1  id="chapter-title"><span>' + this.meta.chapter + '</span></h1>': "";	
			this.meta.chapterAuthor ? this.introDiv += '<h4  id="author"><span><i>by </i><br><b>' + this.meta.chapterAuthor + '</b></span></h4>' : "";
		}
		this.meta.info ? this.introDiv += '<h4  id="info"><span><i>' + this.meta.info + '</i></span></h4>' : "";
	}
	this.introDiv += '</div>';
	
	this.loadingAnimation = document.createElement('img');
	this.loadingAnimation.id = 'loading-animation';
	this.loadingAnimation.src = this.okuPath + "img/loading.gif";
	document.body.appendChild(this.loadingAnimation);
	
	var layers = document.createElement('div');
	document.body.appendChild(layers);
	layers.innerHTML = '<div id="toplayer">'
		+'<div id="firstplay">'
		+'<img  id="firstplaybutton" src="' + this.okuPath + 'img/start.png" style="' + (this.embedded ? '-webkit-filter: saturate(50%); filter: saturate(50%);':'') + '">'
		+'</div></div>'
		+'<nav class="navbar navbar-default navbar-fixed-bottom">'
		+'<div id="display-options" >'
		+'<span id="stop" tabindex="1" class="btn btn-primary" ><span class="glyphicon glyphicon-pause" aria-hidden="true"></span></span>'
		+'<span id="play" tabindex="1" class="btn btn-primary" ><span class="glyphicon glyphicon-play" aria-hidden="true"></span></span>'
		+ (this.meta.fullscreen && this.embedded ? '<span  id="fullscreen-link" tabindex="1" title="Fullscreen" onclick="top.location.href = \'' + this.meta.fullscreen + '\'" class="btn btn-primary"' +  'target="_top"' + '><span class="glyphicon glyphicon-fullscreen" aria-hidden="true"></span></span>' : '')
		+'<span id="set-text-size"  class="dropdown">'
		+'<label for="toggle-1" id="show-text-sizes" class="dropdown-toggle btn btn-primary"  data-toggle="dropdown"  ><span class="glyphicon glyphicon-text-size" aria-hidden="true"></span></label><input type="checkbox" id="toggle-1">'
		+'<ul id="text-sizes" class="dropdown-menu"  style="list-style: none;" >'
		+'<li><div><input type="radio" value=0  name="fontSize">XX-Small</div></li>'
		+'<li><div><input type="radio" value=1  name="fontSize">X-Small</div></li>'
		+'<li><div><input type="radio" value=2  name="fontSize">Small</div></li>'
		+'<li><div><input type="radio" value=3  name="fontSize" checked>Medium</div></li>'
		+'<li><div><input type="radio" value=4  name="fontSize">Large</div></li>'
		+'<li><div><input type="radio" value=5  name="fontSize">X-Large</div></li>'
		+'<li><div><input type="radio" value=6  name="fontSize">XX-Large</div></li>'
		+'</ul>'
		+'</span>'
		+'<span  id="show-tt-config" class="dropdown"><label  for="toggle-2"  class="dropdown-toggle btn btn-primary" data-toggle="dropdown"  ><span class="glyphicon glyphicon-cog" aria-hidden="true"></span></label><input type="checkbox" id="toggle-2">'
		+'<ul class="dropdown-menu"  style="list-style: none;">'
		+'<li><div  id="night-mode" ><input id="nmode"  type="checkbox" >Night Mode</div></li>\n'
		+'<li><div id="dcont" ><input id="cont" type="checkbox" '  + (this.continuous ? 'checked ' : "") + 'value="cont">Continuous</div> </li>'
		+'<li><div id="dautoscroll" ><input id="autoscroll" type="checkbox" '  + (this.autoscroll ? 'checked ' : "") + 'value="dautoscroll">Auto-scroll</div></li>'
		+'<li><div  id="blockview" ><input id="select-display-mode"  type="checkbox" >Block View</div></li>\n'
		+'<li><div  id="shortcuts-list" >Shortcuts</div></li>\n'
		+'</ul>'
		+'</span>'
		+'<span id="navigation" class="btn-group">'
		+ (this.meta.previuos ? '<span  id="previous-link" tabindex="1" title="Previuos Chapter" onclick="top.location.href = \'' + this.meta.previuos + '\'" class="btn btn-primary"'  + '><span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span></span>' : '')
		+ (this.meta.toc ? '<span  id="toc-link" tabindex="1" title="Table of Contents" onclick="top.location.href = \'' + this.meta.toc + '\'" class="btn btn-primary"'  + '><span class="glyphicon glyphicon-list" aria-hidden="true"></span></span>' : '')
		+ (this.meta.next ? '<span  id="next-link" tabindex="1" title="Next Chapter" onclick="top.location.href = \'' + this.meta.next + '\'" class="btn btn-primary"'  + '><span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span></span>' : '')
		+'</span>'
		+'</div>'
		+'</nav>';
		

	
	var bscss = document.createElement('style');
	bscss.innerHTML = '@import "' +  this.okuPath + 'css/bootstrap.css";'
					+ '@import "' +  this.okuPath + 'css/outer.css' + '";'
	document.head.appendChild(bscss);
	
	
	console.log(this.xhtmlPath, this.syncmapPath, this.audioPaths);
	
	this.loadFile = function (url, callback) {
				var req = new XMLHttpRequest();
				req.open("GET", url, true);
				req.onreadystatechange = (function () {
					if (req.readyState == 4) {
						console.log(this);
						callback(req.responseText);
					}
				}).bind(this)
				req.send(null);
	}


	this.loadFile(this.xhtmlPath, (function(xhtmlContent) {
			if (xhtmlContent){
				console.log(this);
				this.xhtmlDocument = this.innerFrame.contentWindow.document;
				this.xhtmlDocument.open();
				this.xhtmlDocument.write(xhtmlContent);
				this.xhtmlDocument.close();
				this.xhtmlBodyText = this.xhtmlDocument.body.innerHTML;
				this.xhtmlDocument.open();
				this.xhtmlDocument.write('<head>' 
							+ this.xhtmlHead
							+ '</head>\n<body>'
							+ this.introDiv 
							+ '<div id="xhtml-content" >'
							+ this.xhtmlBodyText
							+ '</div></body>');
				this.xhtmlDocument.close();
				this.audio = this.xhtmlDocument.body.appendChild(this.audio);
				if(this.browser === "android_native") this.audio.src = this.audio.source[0].src;
				this.audio.load();



				this.xhtmlContentDiv =  this.xhtmlDocument.querySelector("#xhtml-content");
				this.xhtmlContentDiv.className = "regular-view nopage";
				this.fragmentElements = this.xhtmlContentDiv.querySelectorAll("." + this.fragmentClassName);
				this.loadFile(this.syncmapPath, (function(syncmapContent) {
					
                   
                    if (syncmapContent){
                        
                        syncmap = JSON.parse(syncmapContent);
						this.fragments = syncmap.fragments;
						for(var i=0; i < this.fragments.length; i++){
							this.fragments[i].element = this.fragmentElements[i];
                            this.fragments[i].index = i;
							this.fragments[i].element.addEventListener("click", this.playFragment.bind(this, i))
                            if (this.translation && this.fragments[i].tr && this.fragments[i].tr[this.translation]){
                                this.fragments[i].element.textContent = this.fragments[i].tr[this.translation];
                            }
                        }

						this.currentIndex = -1;
						this.intro = {};
						this.intro.begin = 0;
						this.intro.end = this.fragments[0].begin;
                        this.intro.index = -1;
						this.intro.element =  this.xhtmlDocument.querySelector("#intro-div");
						this.fragments[-1] = this.intro;
						this.intro.element.addEventListener("click", this.playFragment.bind(this, -1))
						this.currentFragment = this.fragments[-1];
						// console.log(this.intro);
						this.intro.element.offsetParent.scrollTop = this.intro.element.offsetTop;
						this.toplayer = document.querySelector("#toplayer");
						var firstPlay = document.querySelector("#firstplay");

						document.querySelector("#play").addEventListener("click", (function() {
                                this.play();
                            }).bind(this));
						document.querySelector("#stop").addEventListener("click", (function() {
                                this.suspend();
                            }).bind(this));
						document.querySelector("#show-text-sizes").addEventListener("click", function(){
									document.querySelector("#toggle-2").checked = false;
								});
						document.querySelector("#show-tt-config").addEventListener("click", function(){
									document.querySelector("#toggle-1").checked = false;
								});
						document.querySelector("#dcont").addEventListener("click", (function(e){
									if(e.currentTarget === e.target) {
										e.currentTarget.firstElementChild.click();
										document.getElementById("toggle-2").checked = false;
									}
									this.continuous = e.currentTarget.firstElementChild.checked
							}).bind(this));
						document.querySelector("#night-mode").addEventListener("click", (function(e){
									if(e.currentTarget === e.target) {
										e.currentTarget.firstElementChild.click();
										document.getElementById("toggle-2").checked = false;
									}
									if(e.currentTarget.firstElementChild.checked){
										this.xhtmlDocument.body.className = "night-mode";
										document.body.className = "night-mode";
									}
									else{
										this.xhtmlDocument.body.className = "day-mode";
										document.body.className = "day-mode";
									}									
							}).bind(this));
                        // document.querySelector("#night-mode").click();
							
						document.querySelector("#dautoscroll").addEventListener("click", (function(e){
									if(e.currentTarget === e.target) {
										e.currentTarget.firstElementChild.click();
										document.getElementById("toggle-2").checked = false;
									}
									this.autoscroll = e.currentTarget.firstElementChild.checked
							}).bind(this));
							
						document.querySelector("#blockview").addEventListener("click", (function(e){
									if(e.currentTarget === e.target) {
										e.currentTarget.firstElementChild.click();
										document.getElementById("toggle-2").checked = false;
									}
									if (e.currentTarget.firstElementChild.checked) {
									this.xhtmlContentDiv.className = "block-view";
									this.xhtmlContentDiv.className = this.xhtmlContentDiv.className.replace(/regular-view/,"block-view");
								}
								else {
									this.xhtmlContentDiv.className = this.xhtmlContentDiv.className.replace(/block-view/,"regular-view");
								}
								if (!this.isFragmentInView(this.currentIndex)){
									this.events.pageended.dispatch();
								}
							}).bind(this));
                         
                        document.querySelector("#shortcuts-list").addEventListener("click", (function(e){
                            document.getElementById("toggle-2").checked = false;
                            alert(this.shortcutslist);
                        }).bind(this));
							
						var fontSizes = ["50%", "65%", "80%", "100%", "130%", "170%", "220%"];
						var fontSizeRadios = document.querySelectorAll("#text-sizes div");
						for(i=0; i<fontSizeRadios.length; i++) {
							fontSizeRadios[i].addEventListener("click", (function(e){
									if(e.currentTarget === e.target) {
										e.currentTarget.firstElementChild.click();
										document.getElementById("toggle-1").checked = false;
									}
                                    this.fontSize = e.currentTarget.firstElementChild.value;
									this.xhtmlContentDiv.style.fontSize = fontSizes[this.fontSize];
									if (!this.isFragmentInView(this.currentIndex)){
										this.events.pageended.dispatch();
									}											// console.log(i, fontSizes, fontSizes[i], this.xhtmlContentDiv.style.fontSize);
								}).bind(this))
						}
/* 						document.querySelector("#toc-link").addEventListener("click", function(e){
								location.href = location.origin + e.currentTarget.getAttribute("data-href");
							}); */
							
							if(this.embedded){
								fontSizeRadios[2].click();
								//document.body.style.overflowY = "scroll";
							}								
/* 							if(innerHeight>1000 || innerWidth>1000){
								document.querySelector(".navbar").style.maxWidth = "initial";
								document.querySelector(".navbar").style.maxWidth = "initial";
								//document.querySelector(".navbar").className = document.querySelector(".navbar").className.replace(/top$/,"bottom");
								var buttons = document.querySelectorAll(".navbar .btn");
								for (i=0; i<buttons.length; i++){
									console.log(buttons[i]);
									buttons[i].className += " btn-lg";
								}
								
							}	 */								
							this.xhtmlDocument.body.style.visibility = "visible";
							firstPlay.onclick = (function(){
								this.loadingAnimation.style.display = 'block';
/* 								this.audio.addEventListener('seeking', function(){
									this.loadingAnimation.style.display = 'block';
								});
								this.audio.addEventListener('canplay', function(){
									this.loadingAnimation.style.display = 'none';
								});
								this.audio.addEventListener('playing', function(){
									this.loadingAnimation.style.display = 'none';
								});
								this.audio.addEventListener('seeked', function(){
									this.loadingAnimation.style.display = 'none';
								}); */
                                
								firstPlay.style.display = "none";
								this.xhtmlDocument.body.style.color = "#333";
								// document.body.style.overflowY = "auto";
								this.navbar = document.querySelector(".navbar");
								this.navbar.style.display = "block";
								this.toplayer.style.display = "none";
								this.container.style.top = "0";
								this.container.style.bottom = "55px";
								this.container.style.height = "auto";
/* 								this.xhtmlDocument.body.onmousemove = showHideOptions.bind(this);
								document.body.onmousemove = showHideOptions.bind(this);
								this.xhtmlDocument.body.ontouchstart = showHideOptions.bind(this);
								document.body.ontouchstart = showHideOptions.bind(this); */
								this.xhtmlDocument.body.style.overflow = "auto";
                                // this.audio.playbackRate = 0.9;
								this.play();
                                if(0 < this.startFrom < this.fragments.length) {
                                    setTimeout( (function(){
                                            this.playFragment(this.startFrom);
                                            this.audio.currentTime = this.currentFragment.begin-this.seekBuffer;
                                        }).bind(this), 100)
                               }
                                window.onkeydown = catchKey.bind(this);
                                this.innerFrame.contentWindow.onkeydown = catchKey.bind(this);
                                
                                var tabreach = document.querySelectorAll("[tabindex]");
                                for (i=0; i<tabreach.length; i++) {
                                    console.log("tabindex", tabreach[i]);
                                    tabreach[i].onkeydown = function(evt) {
                                        if(evt.keyCode == "13") {
                                            tabreach[i].click();
                                            if(tabreach[i].id == "stop") document.querySelector("#play").focus();
                                            if(tabreach[i].id == "play") document.querySelector("#stop").focus();
                                        }
                                       
                                    }
                               }
                                
							}).bind(this);
                            
                            window.onkeydown = catchKeyBeforeStart.bind(this);
                            this.innerFrame.contentWindow.onkeydown = catchKeyBeforeStart.bind(this);
                            
/* 						if(this.audio.readyState > 0){
							this.audio.currentTime = this.currentFragment.begin;
						} */
						this.readyState = 1;
						this.events.loaded.dispatch();
					}
					else {
						
					}
				}).bind(this))
			}
		}).bind(this))

	var audio = this.audio;
	this.audio = document.createElement("audio");
	this.audio.preload = "auto";
	// this.audio.controls = "controls";
	this.audio.source = [];
	console.log(this.audioPaths);
	for (var i=0; i<this.audioPaths.length; i++ ) {
		this.audio.source[i] = document.createElement("source");
		this.audio.source[i].src = this.audioPaths[i];
		var extensionCheck = this.audioPaths[i].match(/^.+\.([^.]{3})$/, "");
		if(extensionCheck) {
			this.audio.source[i].type = "audio/" + extensionCheck[1];
		}
		this.audio.appendChild(this.audio.source[i]);
	}
	console.log(this.audio.outerHTML);

	//if(this.browser.match(/firefox|android_native|android_chrome/)) {
	if(this.browser.match(/firefox/)) {
		var firstOgg = this.audio.querySelector("[type='audio/ogg']");
		console.log("ooooggggg", firstOgg);
		if(firstOgg){
			this.audio.insertBefore(firstOgg, this.audio.source[0]);

		}
		else{
			this.seekBuffer = 1;	
			console.log("no ogg:(");
		}
		// console.log("lame fix:", this.lameFix );
	}
	else{
	}
/* 	this.audio.addEventListener("durationchange", (function(){
		this.lameFix = this.audio.currentSrc.match(/\.mp3$/i)? (this.browser == "android_native" || this.browser == "android_chrome" || this.browser == "windows_firefox" || this.browser == "linux_firefox") : false;
		console.log("lame fix:", this.lameFix );
		}).bind(this)) */

	this.activateFragment = function(fragmentIndex) {
		console.log("activating element", fragmentIndex);
		this.currentIndex = fragmentIndex;
		this.currentFragment = this.fragments[fragmentIndex];
		this.currentFragment.element.className = "fragm fragm-active";
		if (!this.isFragmentInView(this.currentIndex) &&
            this.currentFragment.element.getAttribute('data-inview') !== "true"
            ){
			this.events.pageended.dispatch();
		}
		else{
			
		}
	}
	
	this.playFragment = function(fragmentIndex){
		console.log("deactivating last element", this.currentIndex);
        console.log(this.currentFragment);
		this.currentFragment.element.className = "fragm";
		this.activateFragment(fragmentIndex);
		!this.seekBuffer && this.browser == "android_chrome" ? this.audio.muted = true : "";
		if(this.audio.readyState > 0){
			this.audio.currentTime = this.currentFragment.begin-this.seekBuffer;
		}
		this.audio.onseeked = (function(){
			audio.onseeked = null;
			var targetTime = this.fragments[fragmentIndex].begin;
			var seekedDelay = this.audio.currentTime - targetTime;
			console.log("SEEK DELAY = \n\n\n\n\n\n\n\n", seekedDelay);
			if(seekedDelay < -0.2){
				console.log("%c timeout starts", "color:orange; font-size:22px", audio.currentTime, targetTime)
				setTimeout((function(){
						console.log("%c timeout ended", "color:orange; font-size:22px", audio.currentTime, targetTime)
					if(audio.currentTime >= targetTime-0.07) {
						audio.ontimeupdate = null;
						audio.onprogress = null;
						audio.muted = false;
						console.log("%c Timeout UNMUTED: " + audio.currentTime + ", TARGET: " + targetTime,"color:orange; font-size:22px");
					}
				}).bind(this), seekedDelay*-1000/audio.playbackRate);
			}
			else{
				audio.muted = false;
			}
		}).bind(this)
		audio.ontimeupdate = audio.onprogress = (function(){
			if(audio.currentTime > this.fragments[fragmentIndex].begin-0.07) {
				audio.muted = false;
				console.log("%c timeupdate UNMUTED: " + audio.currentTime + ", TARGET: " + this.fragments[fragmentIndex].begin,"color:orange; font-size:22px");
				audio.ontimeupdate = null;
				audio.onprogress = null;
				audio.onseeked = null;
			}
		}).bind(this)
		// this.audio.play();
		this.play();
	}
	
	this.activateNextElement = function(){
		console.log("deactivating last element", this.currentIndex);
		this.currentFragment.element.className = "fragm";
		this.currentIndex = this.currentIndex+1;
		this.activateFragment(this.currentIndex);
		this.catchFragmentEnd();
	}



	this.paused = true;
	this.suspend = function(){
		if(!this.audio.paused){
			this.currentFragment.element.className = "fragm fragm-paused";
			document.querySelector("#stop").style.display = "none";
			document.querySelector("#play").style.display = "inline-block";
			this.audio.pause();
			this.paused=true;
		}
	}
	
	this.audio.addEventListener("pause", (function(){
					this.paused=true}).bind(this)
				);

	function eventDispatcher (){   // temp solution. built-in synthetic events have compatibility issues.
		this.listeners.forEach(function(listener){
		if(typeof listener === "function") listener()})
	}
	
	
	this.events = {	loaded:{listeners:[],dispatch:eventDispatcher},
					fragmentended:{listeners:[],dispatch:eventDispatcher},
					pageended:{listeners:[],dispatch:eventDispatcher},
					timedtextended:{listeners:[],dispatch:eventDispatcher}
				};
	
			
	this.on = (function(eventname, listener){
		console.log(this);
		console.log(listener, "adding to", eventname)
		if( typeof listener === "function" && Array.isArray(this.events[eventname]["listeners"]))	{
			this.events[eventname]["listeners"].push(listener);
			console.log(listener, "added to", eventname)
		}
	}).bind(this);
	
	this.on("loaded", function(){
			console.log('loaded fired')
			document.getElementById("loading-animation").style.display = "none";
			document.body.style.visibility = "visible";			
		}
	);
	
	this.play = (function(){
			console.log("played")
			if(this.readyState === 1) {
				this.currentFragment.element.className = "fragm fragm-active";
				document.querySelector("#play").style.display = "none";
				document.querySelector("#stop").style.display = "inline-block";
				this.audio.play();
				this.paused = false;
			}
			else{
				this.on("loaded", this.play);
			}
	}).bind(this);
	

	
	this.removeEventListener = function(eventname, listener){
		if(this.events[eventname]["listeners"].isArray() 
			&& this.events[eventname]["listeners"].indexof(listener)!==-1)	{
			this.events[eventname]["listeners"][listener] = null;
		}
	}


	
	this.catchFragmentEnd = function(){
			//console.log("timeupdate");
			// console.log(this.audio.currentTime);
			//console.log(this.currentIndex);
			// console.log(this);

			// console.log("timeout cleared", this.currentFragment.timeout);
			if(!this.audio) console.log(this);
			if(!this.audio.currentTime) return;
			if(this.audio.currentTime + 1 < this.currentFragment.begin) { // in case something goes wrong 
				console.log(this.audio.currentTime,  this.currentFragment.begin);
				this.suspend(); 
				console.log("something went wrong");
				return ;
			}
			
			var msLeft = (this.currentFragment.end - this.audio.currentTime)*1000/this.audio.playbackRate;
			
			if(msLeft <= -100) { 
				console.log("negative msLeft!!!!!!!!", msLeft, this.audio.currentTime, this.currentIndex, this.currentFragment.end);

				this.events.fragmentended.dispatch();
				return ;
			}
			
			var endsAt = msLeft + (new Date()).getTime();

			if (this.currentFragment.endsAt && this.currentFragment.endsAt - endsAt >= -10 && this.currentFragment.endsAt - endsAt <= 10){
				return;
			}
			this.currentFragment.msLeft = msLeft;
			this.currentFragment.endsAt = endsAt;

			clearTimeout(this.currentFragment.timeout);
			// console.log(this.currentFragment.msLeft);
			// console.log(this.currentFragment.endsAt);
			this.currentFragment.timeout = setTimeout((function(timoutSetter){
				if(!this.audio.paused  && !this.audio.seeking && this.audio.readyState == 4 && !this.audio.error){
					// console.log((new Date()).getTime());
					// console.log(this.currentFragment.endsAt);
					// console.log("caught fragment end");
					if(timoutSetter == this.currentIndex) {
						this.events.fragmentended.dispatch();
					}
				}

			}).bind(this, this.currentIndex), this.currentFragment.msLeft)
			// console.log("timeout set", this.currentFragment.timeout);
	}
	
	
	this.pagedScroll = function (){
		this.xhtmlContentDiv.className = this.xhtmlContentDiv.className.replace(/nopage/, "paged");
		if(this.browser.indexOf("ios_safari") == -1){
			this.innerFrame.contentWindow.onscroll = null;
		}
		else{
			this.innerFrame.offsetParent.onscroll = null;
		}	
	
		for (i=0; i<this.visibleFragments.length; i++) {
			this.visibleFragments[i].element.removeAttribute("data-inview");
			 // console.log("fragment attr removed", i);
		}
		this.visibleFragments = [];
		
		if(!this.pagebreak1) {
			this.pagebreak1 = this.xhtmlDocument.createElement("div");
			this.pagebreak1.id = "pagebreak1";
		}
/* 		else if(this.pagebreak2 && (this.pagebreak2.nextElementSibling ===  this.currentFragment.element || (this.currentIndex > 0 && this.pagebreak2.previousSibling === this.fragments[this.currentIndex-1].element))){
			this.pagebreak1 ? this.xhtmlDocument.body.removeChild(this.pagebreak1);
			this.pagebreak1 = this.pagebreak2;
			this.pagebreak2 = null;
			console.log("second pagebreak converted to first pagebreak");
		} */

		this.pagebreak1 = this.currentFragment.element.parentNode.insertBefore(this.pagebreak1, this.currentFragment.element);
		console.log("first pagebreak moved");
		
		if(!this.pagebreak2) {
			this.pagebreak2 = this.xhtmlDocument.createElement("div");
			this.pagebreak2.id = "pagebreak2";
		}

/* 		pagebreaks = this.xhtmlDocument.getElementsByClassName("pagebreak"); 
		
		for (i=pagebreaks.length-1; i>=0; i--) {
			pagebreaks[i].outerHTML = "";
			 console.log("a pagebreak removed", i);
		} */
		
			console.log("before first scroll", this.currentFragment.element.offsetParent.scrollTop, this.currentFragment.element.offsetTop);

		//this.currentFragment.element.offsetParent.scrollTop = this.currentFragment.element.offsetTop;
		if(this.browser.indexOf("ios_safari") == -1){
			this.currentFragment.element.offsetParent.scrollTop = this.currentFragment.element.offsetTop;
			this.innerFrame.contentWindow.scroll(0, this.currentFragment.element.offsetTop);
			console.log("offset parent", this.currentFragment.element.offsetParent);
			console.log("first scroll", this.currentFragment.element.offsetParent.scrollTop, this.currentFragment.element.offsetTop);
		}
		else{
			console.log("ios before first scroll",this.innerFrame.offsetParent.scrollTop, this.innerFrame.offsetTop, this.currentFragment.element.offsetTop);
			this.innerFrame.offsetParent.scrollTop =  this.innerFrame.offsetTop + this.currentFragment.element.offsetTop;
			//this.currentFragment.element.scrollIntoView();
			console.log("ios after first scroll",this.innerFrame.offsetParent.scrollTop, this.innerFrame.offsetTop, this.currentFragment.element.offsetTop);
		}
		for(var i = this.currentIndex; i<this.fragments.length; i++) {
			console.log(i,this.innerFrame.offsetParent.scrollTop, this.innerFrame.offsetTop, this.currentFragment.element.offsetTop);
			if(this.isFragmentInView(i)) {
				console.log("visible", i);
				this.fragments[i].element.setAttribute("data-inview", "true");
				this.visibleFragments.push(this.fragments[i]);
			}
			else{
				if (i == this.currentIndex) {
					// console.log("one semi-visible");
					this.currentFragment.element.setAttribute("data-inview", "true");
					this.visibleFragments.push(this.currentFragment);
					if(this.currentFragment.element.parentNode.lastChild == this.currentFragment.element){
						this.currentFragment.element.parentNode.appendChild(this.pagebreak2);
					}
					else{
						this.pagebreak2 = this.currentFragment.element.parentNode.insertBefore(this.pagebreak2, this.currentFragment.element.nextSibling);
					}
					console.log("second pagebreak moved");
					if(this.browser.indexOf("ios_safari") !== -1){
						this.currentFragment.element.scrollIntoView(); // without this somehow single large fragments cause to scroll to top
					}
				}
				else{
					console.log("ios before second scroll 0",this.innerFrame.offsetParent.scrollTop, this.innerFrame.offsetTop, this.currentFragment.element.offsetTop);
					if(this.fragments[i-1].element.parentNode.lastChild == this.fragments[i-1].element){
						this.fragments[i-1].element.parentNode.appendChild(this.pagebreak2);
					}
					else{
						this.pagebreak2 = this.fragments[i-1].element.parentNode.insertBefore(this.pagebreak2, this.fragments[i-1].element.nextSibling);
					}
					console.log("ios before second scroll 1",this.innerFrame.offsetParent.scrollTop, this.innerFrame.offsetTop, this.currentFragment.element.offsetTop);
					console.log("second pagebreak moved");
					if(this.browser.indexOf("ios_safari") == -1){
						console.log("before second scroll", this.innerFrame.contentWindow.scrollY, this.innerFrame.contentWindow.innerHeight, this.pagebreak2.offsetTop, this.currentFragment.element.offsetTop);
						console.log("before second scroll", -1/2*(this.innerFrame.contentWindow.innerHeight - (this.pagebreak2.offsetTop - this.currentFragment.element.offsetTop)));
						this.innerFrame.contentWindow.scrollBy(0, -1/2*(this.innerFrame.contentWindow.innerHeight - (this.pagebreak2.offsetTop - this.currentFragment.element.offsetTop)));
						console.log("second scroll");
						console.log("after second scroll", this.innerFrame.contentWindow.scrollY, this.currentFragment.element.offsetParent.scrollTop,this.innerFrame.contentWindow.innerHeight, this.pagebreak2.offsetTop, this.currentFragment.element.offsetTop);
					}
					else{
						console.log("before second scroll", window.scrollY,  window.innerHeight, this.pagebreak2.offsetTop  - this.currentFragment.element.offsetTop);
						this.innerFrame.offsetParent.scrollTop =  this.innerFrame.offsetTop + this.currentFragment.element.offsetTop;
						console.log("before second scroll", window.scrollY,  window.innerHeight, this.pagebreak2.offsetTop  - this.currentFragment.element.offsetTop);
						this.innerFrame.offsetParent.scrollTop += -1/2*((window.innerHeight - 55) - (this.pagebreak2.offsetTop  - this.currentFragment.element.offsetTop))
						console.log("after second scroll", window.scrollY,  window.innerHeight, this.pagebreak2.offsetTop  - this.currentFragment.element.offsetTop);
					}				
				
				}
				this.pagebreak1.id = "pagebreak1";
				this.pagebreak2.id = "pagebreak2";
				break;
			}
		}

		setTimeout((function(){
			if(this.browser.indexOf("ios_safari") == -1){
				this.innerFrame.contentWindow.onscroll = this.unpagify.bind(this);
			}
			else{
				this.innerFrame.offsetParent.onscroll = this.unpagify.bind(this);
			}
			console.log("unpagify added");
		}).bind(this), 150);
		// if(this.browser.indexOf("ios") == -1)document.querySelector("#toplayer").style.display = "block";
		console.log("scrolled into view");
	}
	this.unpagify = function(){
		if(this.browser.indexOf("ios_safari") == -1){
			this.innerFrame.contentWindow.onscroll = null;
		}
		else{
			this.innerFrame.offsetParent.onscroll = null;
		}
		// console.log(this);
		this.xhtmlContentDiv.className = this.xhtmlContentDiv.className.replace(/paged/, "nopage");
		for (i=0; i<this.visibleFragments.length; i++) {
			this.visibleFragments[i].element.setAttribute("data-inview", "false");
			this.visibleFragments[i].element.removeAttribute("data-inview");
		}
		this.visibleFragments = [];
		console.log("unpagify called & removed");
		document.querySelector("#toplayer").style.display = "none";
		
	}
	
	this.audio.addEventListener("timeupdate", this.catchFragmentEnd.bind(this));
	
	this.audio.onplaying = (function(){
				if(!this.mobile){
					this.innerFrame.contentWindow.onresize = (function(){
						console.log("resized", innerWidth, innerHeight, this.innerFrame.contentWindow.innerWidth, this.innerFrame.contentWindow.innerHeight);
						setTimeout(this.scroll.bind(this), 150)
					}).bind(this);
				}
				else{
					window.onorientationchange = (function(){
						console.log("orientation changed", innerWidth, innerHeight, this.innerFrame.contentWindow.innerWidth, this.innerFrame.contentWindow.innerHeight);
						setTimeout(this.scroll.bind(this), 150)
					}).bind(this);		
				}
			}).bind(this);
			
	function logAudioEvent(event){
		if(event.type==="waiting" || event.type==="seeking" || event.type==="stalled") {			
			setTimeout(function(){
				if(audio.seeking){
					document.querySelector('#loading-animation').style.display = "block";
					console.log("showed");
				}
			},300)
		}
		else if(event.type==="loadeddata" || event.type==="timeupdate" ||event.type==="seeked" || event.type==="playing" || event.type==="canplay" || event.type==="canplaythrough"){
			document.querySelector('#loading-animation').style.display = "none";
		}
		/* console.log(event.type + ' at : ' + ((new Date()).getTime()),
				", readyState:", audio.readyState,
				", networkState: ", audio.networkState,
				", current time: ", audio.currentTime,
				", muted: ", audio.muted,
				", playback rate: ", audio.playbackRate,
				", duration: ", audio.duration,
				", decoded bytes: ", audio.webkitAudioDecodedByteCount,
				", buffered: ", getbuffered(),
				audio.firstChild.type);		
		console.log([event.type + ' at : ' + ((new Date()).getTime()),
				" readyState:", audio.readyState,
				" networkState: ", audio.networkState,
				" current time: ", audio.currentTime,
				" muted: ", audio.muted,
				" playback rate: ", audio.playbackRate,
				" duration: ", audio.duration,
				" decoded bytes: ", audio.webkitAudioDecodedByteCount,
				" buffered: ", getbuffered(),
				" src: ", audio.src,
				" currentSrc: ", audio.currentSrc,
				" error: ", audio.error,
				audio.firstChild.type]); */
		} ;
	function getbuffered() {
		var buffered =[];
		for(i=0; i<audio.buffered.length; i++) {
			buffered[i] = audio.buffered.start(i) + "||" + audio.buffered.end(i)
		}
		buffered.join(")(");
		buffered = "(" + buffered + ")";
		return buffered;
	}
	audio = this.audio;
	["load", "loadstart", "loadeddata", "loadedmetadata", "ended", "pause", "canplay", "canplaythrough",
	"progress", "seeking", "suspend", "stalled", "waiting",
	"playing", "seeked", "play"].forEach(function(event){
		audio.addEventListener(event, logAudioEvent)
		})

	this.on("fragmentended", (function(){
				if( this.currentIndex < this.fragments.length - 1){
					this.continuous ? this.activateNextElement() : this.suspend();
				}
				else{
					this.events.timedtextended.dispatch();
				}
			}).bind(this)
	);
	this.scroll = function(){
		if(this.pagedView) {
			this.pagedScroll();
		}
		else {
			this.currentFragment.element.offsetParent.scrollTop = this.currentFragment.element.offsetTop;
		}
	};
	
	this.on("pageended", (function(){
			if(this.autoscroll) this.scroll()
		}).bind(this)
	);
	
	this.on("timedtextended", (function(){
					this.playFragment(0);
					this.suspend();
					this.scroll();
				}).bind(this)
	);

	this.xhtmlHead = '<meta charset="utf-8">';
	this.xhtmlHead += '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
	this.xhtmlHead += '<style >body{visibility:hidden}</style>';
	this.xhtmlHead += '<meta name="apple-mobile-web-app-status-bar-style" content="black">';
	this.xhtmlHead += '<style >@import "' +  this.okuPath +'css/inner.css";</style>';
	this.xhtmlHead += '<meta http-equiv="cache-control" content="max-age=0" />'
	this.xhtmlHead += '<meta http-equiv="cache-control" content="no-cache" />'
	this.xhtmlHead += '<meta http-equiv="expires" content="0" />'
	this.xhtmlHead += '<meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />'
	this.xhtmlHead += '<meta http-equiv="pragma" content="no-cache" />'
	
	this.isFragmentInView = function(i){
		var element = this.fragments[i].element;
		var contentWindow = this.innerFrame.contentWindow;

		if(this.browser.indexOf("ios_safari") == -1){
			var visible = element.offsetTop >= contentWindow.pageYOffset
					&& element.offsetTop + element.offsetHeight <= contentWindow.pageYOffset + contentWindow.innerHeight;
					console.log(i, visible,   element.offsetTop,contentWindow.pageYOffset, element.offsetTop + element.offsetHeight, contentWindow.pageYOffset + contentWindow.innerHeight);
		}
		else {
			var visible = element.offsetTop +  this.innerFrame.offsetTop >= this.innerFrame.offsetParent.scrollTop
					&& element.offsetTop + element.offsetHeight + this.innerFrame.offsetTop  <=  this.innerFrame.offsetParent.scrollTop + (innerHeight - 55);
					// console.log("ios_safari", visible,   element.offsetTop,  window.pageYOffset);
		}
		// console.log(visible);
		return visible;
	}
	
function showHideOptions(e) {
	if((e.type != "mousemove") || (pointerC != e.screenX + "-" + e.screenY)){
		document.querySelector("#toplayer").style.display = "none";
		// console.log("showing options", pointerC);
		clearTimeout(this.optionsShowTimeout);
		this.optionsShowTimeout = setTimeout((function(){
			if(this.browser.indexOf('ios') !== 0) document.querySelector("#toplayer").style.display = "block";
		}).bind(this), 2000);
	}
	if(e.type == "mousemove") pointerC = e.screenX + "-" + e.screenY;
}	

function getFinalURL(url, audio) {

	request = new XMLHttpRequest();
	request.open('HEAD', url, true);
	request.onload = function() {
		if(!request.responseURL){
		} 
		else if(request.responseURL != url){
			getFinalURL(request.responseURL, audio);
		}
		else {
			
			var firstDirectory = url.replace(/^(.+)\/[^/]*./, '$1');
			var finalDirectory = request.responseURL.replace(/^(.+)\/[^/]*./, '$1');
			for(i=0; i<audio.source.length; i++){
				audio.source[i].src = audio.source[i].src.replace(firstDirectory, finalDirectory);
			}

		}
	}
	request.send();
}

// shortcuts
function catchKey(evt) {

        var charPressed = String.fromCharCode(evt.keyCode).toLowerCase();
        console.log("char pressed: \"" + charPressed + "\"");
        //alert(charPressed);
        if  (evt.keyCode == 37 || evt.keyCode == 49 || evt.keyCode == 97) {
            if(!this.pagedView) return;
            if (!this.visibleFragments || !this.visibleFragments.length) {
              this.scroll();
            }
            console.log(this.visibleFragments);
            var newIndex = this.visibleFragments[0].index - 1;
            if (newIndex < -1) return;
            var lastFragmentOnPage = this.fragments[newIndex].element;
            console.log("previous page ends with fragment", newIndex, lastFragmentOnPage);
            
            var contentWindow = this.innerFrame.contentWindow;
            this.unpagify();
            console.log(lastFragmentOnPage.offsetTop, lastFragmentOnPage.offsetHeight, contentWindow.pageYOffset, contentWindow.innerHeight);
            contentWindow.scroll(contentWindow.pageXOffset, lastFragmentOnPage.offsetTop + lastFragmentOnPage.offsetHeight - contentWindow.innerHeight) ;
            console.log(lastFragmentOnPage.offsetTop, lastFragmentOnPage.offsetHeight, contentWindow.pageYOffset, contentWindow.innerHeight);
            console.log(newIndex, this);

            for(var i = newIndex; i>-2; i--){
                console.log("INDEX", i);
                console.log(lastFragmentOnPage.offsetTop, lastFragmentOnPage.offsetHeight, contentWindow.pageYOffset, contentWindow.innerHeight);

                if(!this.isFragmentInView(i)) {
                    console.log("not in view");
                    break;
                }
                else {
                    var newIndex = i;
                }
            }
            this.playFragment(newIndex);
            this.scroll();
    
        }
        else if (evt.keyCode == 39 || evt.keyCode == 50 || evt.keyCode == 98){
          if(!this.pagedView) return;
          if (!this.visibleFragments.length) {
              this.scroll();
          }
          console.log("visible fragments", this.visibleFragments);
          var newIndex = this.visibleFragments[this.visibleFragments.length-1].index + 1;

          console.log("new index", newIndex);
          console.log(this);
          if(newIndex < this.fragments.length ) this.playFragment(newIndex);
                    
        }
        else {
            switch (charPressed) {
                case "m":
                  this.paused?this.play():this.suspend();
                  break;
                case "w":
                  var newVolume = this.audio.volume + 0.1;
                  if(newVolume > 1) newVolume = 1;
                  this.audio.volume = newVolume;
                  this.audio.muted = false;
                  break;
                case "q":
                  var newVolume = this.audio.volume - 0.1;
                  if(newVolume < 0) newVolume = 0;
                  this.audio.volume = newVolume;
                  this.audio.muted = false;
                  break;
                case "y":
                  var newIndex = this.currentIndex - 1;
                  if(newIndex < -1) newIndex = -1;
                  this.playFragment(newIndex);
                  break;
                case "u":
                  var newIndex = this.currentIndex + 1;
                  if(newIndex > this.fragments.length - 1) break;
                  this.playFragment(newIndex);
                  break;
                case "l":
                  var newPlaybackRate = this.audio.playbackRate + 0.1;
                  if(newPlaybackRate > 2) newPlaybackRate = 2;
                  this.audio.playbackRate = newPlaybackRate;
                  break;
                case "j":
                  var newPlaybackRate = this.audio.playbackRate - 0.1;
                  if(newPlaybackRate < 0.5) newPlaybackRate = 0.5;
                  this.audio.playbackRate = newPlaybackRate;
                  break;
                case "k":
                  this.audio.playbackRate = 1;
                  break;  
                case "a":
                  this.audio.muted ? this.audio.muted = false : this.audio.muted = true;
                  break;
                case "n":
                  document.querySelector("#night-mode").click();
                  break;
                case "d":
                  if(this.fontSize == 6) return;
                  var newFontSize = parseInt(this.fontSize) + 1;
                  console.log(newFontSize);
                  document.querySelectorAll("#text-sizes div")[newFontSize].click();
                  break;  
                case "f":
                  if(this.fontSize == 0) return;
                  var newFontSize = parseInt(this.fontSize) - 1;
                  console.log(newFontSize);
                  document.querySelectorAll("#text-sizes div")[newFontSize].click();
                  break;
                case "s":
                  document.querySelector("#shortcuts-list").click();
                  break;
                case "x":
                  var element = this.currentFragment.element;
                  var contentWindow = this.innerFrame.contentWindow;
                  console.log(element.offsetTop, element.offsetHeight, contentWindow.pageYOffset, contentWindow.innerHeight);
                  this.navbar.style.display = "none";
                  this.container.style.bottom = 0;
                  console.log(element.offsetTop, element.offsetHeight, contentWindow.pageYOffset, contentWindow.innerHeight);
                  break;
                case "v":
                  var element = this.currentFragment.element;
                  var contentWindow = this.innerFrame.contentWindow;
                  console.log(element.offsetTop, element.offsetHeight, contentWindow.pageYOffset, contentWindow.innerHeight);
                  this.navbar.style.display = "block";
                  this.container.style.bottom = "55px";
                  this.innerFrame.style.height = "100%"
                  console.log(element.offsetTop, element.offsetHeight, contentWindow.pageYOffset, contentWindow.innerHeight);
                  if (this.paused) {
                    document.querySelector("#play").focus();
                  }
                  else{
                      document.querySelector("#stop").focus();
                  }
                  console.log(document.activeElement);
                  break;
                default:
                  return;
            }
        }

}


function catchKeyBeforeStart(evt) {
        
        var charPressed = String.fromCharCode(evt.keyCode).toLowerCase();
        console.log("char pressed: \"" + charPressed + "\"");
        //alert(charPressed);

        switch (charPressed) {
        case "m":
          evt.preventDefault();
          window.onkeydown = null;
          this.innerFrame.contentWindow.onkeydown = null;
          document.querySelector("#firstplay").click();
          break;

        default:
          return;
      }

}
this.shortcutslist = "m: play/pause\n\n" +
    "d: increase text size\n" +
    "f: decrease text size\n\n" +
    "w: increase volume\n" +
    "q: decrease volume\n" +
    "a: mute\n\n" +
    "y: previous fragment\n" +
    "u: next fragment\n\n" +
    "l: increase playback rate\n" +
    "j: decrease playback rate\n" +
    "k: reset playback rate\n\n" +
    "n: toggle night mode\n\n" +
    "x: hide toolbar\n" +
    "v: show toolbar\n\n" +
    "left arrow: previous page\n" +
    "right arrow: next page\n\n" +
    "s: show this list\n\n";

    

this.checkSavedSettings = function() {
var cookieObject = {};
    var cookieArray = [];
    if(document.cookie) {
         cookieArray = document.cookie.split(";");
        for (i=0; i<cookieArray.length; i++){
            cookieArray[i] = cookieArray[i].split("=");
            cookieObject[cookieArray[i][0].trim()] =  cookieArray[i][1];
        }
        console.log(cookieObject);
        if(cookieObject.ttSettings) {
            ttSettings = JSON.parse(cookieObject.ttSettings);
            console.log("found settings");
            loadSettings();
        }
        if(cookieObject.currentno) {
            lastcurrentno = parseInt(cookieObject.currentno);
        }

    }

}

this.checkSavedSettings();

this.setCookie = function(){
    document.cookie = "ttSettings=" + JSON.stringify(ttSettings) + "; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/librifs";
    document.cookie = "currentno=" + this.currentIndex + "; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=" + location.pathname;
}

this.loadSettings = function(){
    var a = document.querySelector("#autoscroll");
    var b = document.querySelector("#select-display-mode");
    var c = document.querySelector("#cont");
    var f = document.querySelector("#text-sizes").getElementsByTagName("input");
    console.log(f);
    console.log("a", a, ttSettings.a );

    a.checked = ttSettings.a;
    
    b.checked = ttSettings.b;
    toggleDisplayMode();
    
    c.checked = ttSettings.c;
    
    setFontSize(f[ttSettings.f]);
}
    
}
