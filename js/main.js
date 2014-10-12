var editor = null; 
  
function StartEditor(){ 
	editor = new Editor();
	   
}

function Editor(){  
	//working area 
	
	this.rects = [];
	
	this.textures = [];
	 
	this.textureSize= 256;
	this.spacing = 1;
	
	this.SetSize = function(){
		
		this.areaW = ((window.innerWidth-5)/4*3 - 5);
		this.areaH = (window.innerHeight-5);
		
		this.centerX = this.areaW / 2;
		this.centerY = this.areaH / 2;
		
		this.div = $("EditorDiv");
		this.div.padding = "0px";
		this.div.style.width = this.areaW + "px";
		this.div.style.height = this.areaH + "px";
		 
		
		optWidth = (window.innerWidth-5)/4 ;
		this.divOpt = $("Options");
		this.divOpt.style.padding = "5px";
		this.divOpt.style.width = optWidth -10 + "px";
		this.divOpt.style.height = (window.innerHeight-5 - 8) + "px"; 
		this.divOpt.style.left = window.innerWidth - optWidth - 6 +"px" 
		
		$("output").style.width = (optWidth -25)  + "px";
		
		var helpW = window.innerWidth*3/4;
		var helpH = window.innerHeight*4/5;
		$("help").style.left = (window.innerWidth - helpW)/2 +"px" 
		$("help").style.top = (window.innerHeight - helpH)/2 +"px" 
		$("help").style.width = helpW + "px";
		$("help").style.height = helpH + "px";
		 
		$("textureSize").onchange = function(){ 
			editor.textureSize = parseInt(this.options[this.selectedIndex].innerText);
			console.log(editor.textureSize);
		}; 
	}
	this.SetSize();
	
	  
	$("export").onclick = function(){
		editor.Export();
	};
	  
	$("saveFiles").onclick = function(){
	
		for(var i=0; i<editor.textures.length; i++){
			var canvas = editor.textures[i];
			canvas.toBlob(function(blob) {
				saveAs(  blob , "Atlas"+(i)+".png" );
			}, "image/png");
		}
	}
	
	$("closeHelp").onclick = function(){
		$("help").style.display="none";
	}
	
		
	$("showHelp").onclick = function(){
		$("help").style.display="block";
	}
	
	this.Export = function(){
		var imagesRects = this.rects.slice();
		this.textures = [];
		while (this.div.firstChild) {
			this.div.removeChild(this.div.firstChild);
		}
		
		for(var i = 0; i< this.rects.length; i++){
			var rect = this.rects[i];
			rect.fit = undefined;
			if(rect.w > this.textureSize || rect.h > this.textureSize){
				alert("image '"+rect.image.name+"' is too big for the choosen texture size ("+this.textureSize+"px)");
				return 0;
			} 
		}
		
		
		
		this.rects.sort(function(a, b) {return a.area - b.area})
		
		
		var packer = new Packer(this.textureSize, this.textureSize);
    
	
		var output = {
			width: this.textureSize,
			height: this.textureSize,
			
		};
		
		//render
		var iter = 0; 
		var atlasCount = 0;

		while(this.rects.length > 0){
			
			packer.init(this.textureSize, this.textureSize);
			packer.fit(this.rects);
			var canvas = document.createElement('canvas'); 
			canvas.width = this.textureSize;
			canvas.height = this.textureSize;
			canvas.ctx = canvas.getContext("2d");
			canvas.style.margin = "5px";
			canvas.style.border = "1px dotted black";
			canvas.style.width = Math.min(this.textureSize, 150)+"px";
			canvas.style.height = Math.min(this.textureSize, 150)+"px";
			this.textures.push(canvas);
			this.div.appendChild(canvas);
			  
			var offset = Math.floor(this.spacing/2);
			
			canvas.ctx.clearRect(0, 0, canvas.width, canvas.height); 
			
			 
			var temp = []; 
			while(this.rects.length > 0){
				var rect = this.rects.pop();
				
				if(rect.fit){
					canvas.ctx.drawImage(rect.image, offset+rect.fit.x, offset+rect.fit.y); 
				}
				else{
					temp.push(rect); 
				}
			}
			this.rects = temp; 
			
			if(iter++ > 1000){
				console.log("infinite loop!");
				break; 
			} 
		}  
		
		 


		this.rects = imagesRects; 
		
		$("output").value = "exported the void!";//JSON.stringify(this.verts);
		
		$("saveFiles").style.display = "inline";
	}
	 
	
	//Load image file
	var finput = $("loadFile");
	finput.onchange = function(){ 
	
		editor.rects = [];
		$("imagesContainer").innerHTML = "";
		for(var i=0; i<this.files.length; i++){
			var file = this.files[i]; 
			var fr = new FileReader();
			fr.name = file.name;
			fr.onload = function(){
			
				var extension = this.name.substr(this.name.lastIndexOf('.') + 1).toLowerCase();
 
				if(extension == "png" || extension  == "jpg"  || extension  == "jpeg"  || extension  == "bmp" ){
				
					//image and rect for the atlas
					var img = new Image();
					img.src = this.result;
					img.name = this.name;
					editor.rects.push(new Rect(img)); 
					
					//preview image
					var img = new Image();
					img.src = this.result;
					var ratio = img.height/img.width;
					img.width = 64;
					img.height = 64*ratio;  
					img.style.border = "1px dotted black";
					$("imagesContainer").appendChild(img);
				}
				
			};
			fr.readAsDataURL(file);
		}
	} 
	   
	 
	function Rect(img){
		this.image = img;
		this.x = 0;
		this.y = 0;
		this.w = img.width+editor.spacing*2;
		this.h = img.height+editor.spacing*2;
		this.area = this.w*this.h; 
	}
	 
	    
}
  
  

 


