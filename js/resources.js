function ResourcesHandler(callback){
	//numero risorse caricate/da caricare
	this.resNumber = 0;
	this.resLoaded = 0; 
	this.loading = true;
	this.errors = [];
	this.warnings = [];
	this.status = 0;
	
	this.CheckLoaded = function(){
		if(!this.loading) return null; 
		if(this.resLoaded + this.errors.length >= this.resNumber){
			callback();
			this.loading = false;
			this.resNumber = 0;
			this.resLoaded = 0;
		}
	}
	 
	//carica un immagine e ritorna un id
	this.LoadSprite = function(url, frames, funct){
		this.loading = true;
		var img = new Image();
		img.src = url;
		img.rh = this;
		this.resNumber++;
		img.frames = frames;
		img.onload = function(){ 
			if(funct != undefined){
				funct();
			}
			this.w = this.width/this.frames;
			this.rh.resLoaded++;
			this.rh.CheckLoaded();
		};
		img.addEventListener("error", function(e){
			this.rh.resNumber--;
			this.rh.errors.push([url, e]);
			this.rh.CheckLoaded();
		});
		
		return img;
	}
	 
	
	//carica un suono
	this.LoadSound = function(url, formats){
		this.loading = true;
		var sound = new Audio();
		sound.src = url+"."+formats[0];
		sound.formatIndex = 0;
		sound.volume = 0.05;
		this.resNumber++;
		sound.rh = this;
			
		sound.addEventListener("loadeddata", function(){
			this.rh.resLoaded++; 
			this.rh.CheckLoaded();
		}, false);
			
		sound.addEventListener("error", function(e){
			if(++this.formatIndex >= formats.length){
				this.rh.errors.push([url, e.currentTarget.error.code]);
				this.rh.CheckLoaded();
			}else{
				this.rh.warnings.push(["audio",this.src]);
				this.src = url+"."+formats[this.formatIndex];
			}
		});
			
		return sound;
	} 


}