var editor = null; 
  
function StartEditor(){ 
	editor = new Editor();
	   
}

function Editor(){  
	//working area 
	  
	 
	this.textures = [];
	this.sprites = [];
	this.textureSize= 512;
	this.spacing = 0;
	this.projectSaved = true;
	this.SetSize = function(){
		
		this.areaW = ((window.innerWidth-5)/4*3 - 5);
		this.areaH = (window.innerHeight-5);
		
		this.centerX = this.areaW / 2;
		this.centerY = this.areaH / 2;
		
		this.div = $("EditorDiv");
		this.div.padding = "0px";
		this.div.style.width = this.areaW + "px";
		this.div.style.height = this.areaH + "px";
		 
		
		optWidth = Math.max(330, (window.innerWidth-5)/4) ;
		this.divOpt = $("Options");
		this.divOpt.style.padding = "5px";
		this.divOpt.style.width = optWidth -10 + "px";
		this.divOpt.style.height = (window.innerHeight-5 - 8) + "px"; 
		this.divOpt.style.left = window.innerWidth - optWidth - 6 +"px" 
		
		//$("output").style.width = (optWidth -25)  + "px";
		
		var helpW = window.innerWidth*3/4;
		var helpH = window.innerHeight*4/5;
		
		SetDivSize($("help"), (window.innerWidth - helpW)/2, (window.innerHeight - helpH)/2, helpW, helpH);
		
		SetDivSize($("spriteOptions"), (window.innerWidth - helpW)/2, (window.innerHeight - helpH)/2, helpW, helpH);
		 
	}
	this.SetSize();
	
	  
	var finput=document.createElement('input');
	finput.type="file";
	finput.multiple = true;
	finput.style.display = "none";  
	finput.onchange = function(){
		editor.LoadMultipleSprites(this);
		this.value = '';
	}
	
	$("addSpriteMultiple").onclick = function(){
		finput.click();
	}
		 
	var inputstrip=document.createElement('input');
	inputstrip.type="file";
	inputstrip.multiple = false;
	inputstrip.style.display = "none";  
	inputstrip.onchange = function(){
		editor.LoadSpriteStrip(this);
		this.value = '';
	}
	$("addSpriteStrip").onclick = function(){
		inputstrip.click();
	}
	
	$("textureSize").onchange = function(){ 
		editor.textureSize = parseInt(this.options[this.selectedIndex].innerText); 
	}; 
		
	$("export").onclick = function(){
	
		editor.Export();
	};
	
	
	var finput2=document.createElement('input');
	finput2.type="file"; 
	finput2.style.display = "none";  
	finput2.onchange = function(){
		editor.LoadProject(this);
		this.value = '';
	}
	
	$("newProject").onclick = function(){
		if(editor.projectSaved || confirm("Unsaved changes will be lost, continue?")){
			editor.ClearProject();
		}
	}
	
	$("loadProject").onclick = function(){
		if(editor.projectSaved || confirm("Unsaved changes will be lost, continue?")){
			finput2.click(); 
		}
	}
	this.LoadProject = function(element){ 
		this.ClearProject();
		for(var i=0; i<element.files.length; i++){ 
			
			var file = element.files[i];  
			
			var reader = new FileReader();
			reader.name = file.name; 
			reader.onload = function(){  
				if(getExtension(this.name) == "zip"){
					
					var zip = new JSZip(this.result);
					
					var projFile = zip.files["project.agp"];
					var data = JSON.parse(projFile.asText());
					
					for(var j=0; j<data.length; j++){
						var sprInfo = data[j];
						
						var sprite = editor.AddSprite(sprInfo.name);
						sprite.width = sprInfo.width;
						sprite.height = sprInfo.height;
						
						for(var k=0; k<sprInfo.subimages.length; k++){
							var imageName = "images/"+sprInfo.subimages[k]+".png"; 
							//image and rect for the atlas
							var img = new Image(); 
							img.src = "data:image/png;base64,"+toBase64(zip.files[imageName].asUint8Array());
							 
							var rect = new Rect(img);
							rect.sprite = sprite;
							sprite.rects.push(rect); 
							sprite.container.appendChild(PreviewImage(sprite, img.src, imageName));
							
						}
						
					}
					
					
					/*
					for(var entryName in zip.files){
						entry = zip.files[entryName];
						var ext = getExtension(entryName);
						if(ext == "png"){
							var img = new Image();
							img.src = "data:image/png;base64,"+toBase64(entry.asUint8Array());
							
						}
						
					} 
					*/ 
				}else{
					console.log("wrong format");
				}
			}
		};
		reader.readAsBinaryString(file);
	}
	
	
	$("saveProject").onclick = function(){
		
		var zip = new JSZip();
		 
		var fid = getDateString("_");
		
		var data = [];
		var id = 0;
		for(var i = 0; i < editor.sprites.length; i++){
			var sprite = editor.sprites[i]; 
			var obj = {
				name : sprite.name,
				width : sprite.width,
				height : sprite.height,
				subimages : []
			}
			for(var j = 0; j < sprite.rects.length; j++){
				var img = sprite.rects[j].image; 
				var name = sprite.name + "_"+id;
				obj.subimages.push(name);
				zip.file("images/"+name+".png", img.src.substr(img.src.indexOf(',')+1), {base64: true});
				id++;				
			}
			data.push(obj);
		}
		 
		zip.file("project.agp",  JSON.stringify(data, undefined, 2) ); 
		
		
		var blob = zip.generate({type:"blob"}); 
		saveAs(blob, "AtlasGen"+fid+".zip");
		
		editor.projectSaved = true;
	}
	
	$("saveFiles").onclick = function(){
	
		var zip = new JSZip();
		
		var fid = getDateString("_");
		
		for(var i=0; i<editor.textures.length; i++){
			var canvas = editor.textures[i];
			var savable = new Image();
			savable.src = canvas.toDataURL();
			zip.file("AtlasTexture"+fid + "/textures/AtlasTexture"+fid+".png", savable.src.substr(savable.src.indexOf(',')+1), {base64: true});
				
		}
		
		for(var i=0; i<editor.sprites.length; i++){
			var sprite = editor.sprites[i];
			console.log(sprite.name)
			zip.file("AtlasTexture"+fid + "/sprites/" + sprite.name+".spr", "#texture AtlasTexture"+fid+".png\n" +sprite.text ); 
		}
		var blob = zip.generate({type:"blob"}); 
		saveAs(blob, "AtlasTexture"+fid+".zip");
		
	}
	 
	$("showHelp").onclick = function(){
		$("help").style.display="block";
	}
	
	$("addSprite").onclick = function(){
		editor.AddSprite("sprite"); 
	}
	
	
	
	this.AddSprite = function(spriteName){
		editor.projectSaved = false;
		var spr = {
			name: this.GetUniqueName(spriteName),
			width: 0,
			height: 0,
			text: "",
			rects: []
		};  
		editor.sprites.push(spr);
		
		var p = document.createElement('p');
		p.style.margin.top = "10px";
		 
		var name = document.createElement('input');
		name.type = "text";
		name.value = spr.name; 
		name.style.width = "100px";
		name.sprite = spr;
		name.onkeyup = function(e){ 
			if(!e.ctrlKey && e.keyCode != 17){
				start = this.selectionStart;
				var str = this.value.replace(/[^a-zA-Z0-9_]/g, '');
				if(!editor.NameExists(str)){
					this.sprite.name = str;
				}
				this.value = str;
				this.selectionStart = start;
				this.selectionEnd = start;
			}
		} 
		
		
		name.onchange = function(e){
			if(!editor.NameExists(this.sprite.name)){
				this.sprite.name = this.value;
			}else{
				this.value = this.sprite.name;
				
			}
		}
		
		var container = document.createElement('p'); 
		container.sprite = spr;
		container.name = name;
		spr.container = container;
		var finput=document.createElement('input');
		finput.type="file";
		finput.multiple = true;
		finput.style.display = "none";
		finput.sprite = spr;
		finput.container = container;
		finput.onchange = function(){
			editor.OnChangeFile(this);
			this.value = '';
		}
		
		
		var input=document.createElement('input'); 
		input.type="button";
		input.value = "+ Frame"; 
		input.finput = finput;
		input.onclick = function(){
			finput.click();
		}
		
		var del=document.createElement('input'); 
		del.type="button";
		del.value = "x"; 
		del.sprite = spr;
		del.finput = finput;
		
		del.addEventListener("click",function(e){
			if(e.shiftKey || e.ctrlKey)
				this.parentNode.parentNode.removeChild(this.parentNode);
			else if(confirm("Delete "+this.sprite.name+" ?")){
				this.parentNode.parentNode.removeChild(this.parentNode);
			}
			editor.sprites.splice(editor.sprites.indexOf(this.sprite), 1);
		}, false);
		
		
		$("imagesContainer").appendChild(p);
		p.appendChild(name);
		p.appendChild(finput);
		p.appendChild(input);
		p.appendChild(del);
		p.appendChild(container);
		
		
		var div = document.createElement('div');
		div.style.clear="both";
		div.style.border = "0";
		container.appendChild(div);
		
		return spr;
	}
	
	//Load Multiple Sprites
	this.LoadMultipleSprites = function(element){ 
		for(var i=0; i<element.files.length; i++){
			var file = element.files[i]; 
			
			var reader = new FileReader();
			reader.name = file.name;
			
			console.log("reader");
			reader.onload = function(){
			
				var extension = this.name.substr(this.name.lastIndexOf('.') + 1).toLowerCase();
 
				if(extension == "png" || extension  == "jpg"  || extension  == "jpeg"  || extension  == "bmp" ){
				
					var sprite = editor.AddSprite(this.name); 
					
			
					//image and rect for the atlas
					var img = new Image();
					img.name = this.name;
					img.src = this.result; 
					sprite.width = img.width;
					sprite.height = img.height;
					var rect = new Rect(img);
					rect.sprite = sprite; 
					sprite.rects.push(rect); 
					
					sprite.container.appendChild(PreviewImage(sprite, this.result, this.name)); 
					
				}
				
			};
			reader.readAsDataURL(file);
		}
	}   
	
	var PreviewImage = function(sprite, src, name){
		//preview image
		var img = new Image();
		img.src = src; 
		img.title ="("+img.width+", "+img.height+") "+name;
		img.width = Math.min(48, img.width);
		img.height = Math.min(48, img.height);
		img.style.border = "1px dotted black";
		img.style.margin = "2px"; 
		img.sprite = sprite;
		img.name = name;
		img.onclick = function(e){
			if(e.shiftKey || e.ctrlKey)
				editor.RemoveImage(this);
			else{
				if (confirm("Delete sprite "+this.name+" ?\n\n (Keep CTRL pressed to avoid this dialog on delete)")) {
					editor.RemoveImage(this);
				}
			}
		}
		return img;
	}
	
	
	//Load Multiple Sprites
	this.LoadSpriteStrip = function(element){ 
		for(var i=0; i<element.files.length; i++){
			var file = element.files[i]; 
			
			var reader = new FileReader();
			reader.name = file.name;
			
			reader.onload = function(){
			
				var extension = this.name.substr(this.name.lastIndexOf('.') + 1).toLowerCase();
				
				if(extension == "png" || extension  == "jpg"  || extension  == "jpeg"  || extension  == "bmp" ){
				
					var sprite = editor.AddSprite(this.name); 
					
					console.log("added new sprite");
			
					var count = parseInt(prompt("Number of images", "0"), NaN);
					if(count == NaN)
						return;
					//image and rect for the atlas
					var img = new Image();
					img.name = this.name;
					img.src = this.result;
					img.onload = function(){
						
						sprite.width = img.width / count;
						sprite.height = img.height;
						
						for(var i = 0; i < count; i++)
						{
							console.log("loaded");
							stripImg = CropImage(this, i * sprite.width, 0, sprite.width, sprite.height);
							 
							var rect = new Rect(stripImg);
							rect.sprite = sprite; 
							sprite.rects.push(rect); 
							
							sprite.container.appendChild(PreviewImage(sprite, stripImg.src, img.name)); 
							 
							
						}
					}
						
					
					
				}
				
			};
			reader.readAsDataURL(file);
		}
	}   
	
	
	//Load subimage file
	 
	this.OnChangeFile = function(element){ 
	 
		for(var i=0; i<element.files.length; i++){
			var file = element.files[i]; 
			
			var reader = new FileReader();
			reader.name = file.name;
			
			if(element.sprite.rects.length == 0){
				var newName = editor.GetUniqueName(file.name);
				element.sprite.container.name.value = newName;				
				element.sprite.name = newName; 
			}
			reader.onload = function(){
			
				var extension = file.name.substr(file.name.lastIndexOf('.') + 1).toLowerCase();
 
				if(extension == "png" || extension  == "jpg"  || extension  == "jpeg"  || extension  == "bmp" ){
				
					//image and rect for the atlas
					var img = new Image();
					img.src = this.result;
					
					if(element.sprite.width == 0 || element.sprite.height == 0){
						element.sprite.width = img.width;
						element.sprite.height = img.height;
					}
					if( element.sprite.width == img.width && element.sprite.height == img.height){
						img.name = this.name;
						var rect = new Rect(img);
						rect.sprite = element.sprite;
						element.sprite.rects.push(rect); 
						if(i == 0){
							element.sprite.container.name.value = this.GetUniqueName(this.name)
						}
						element.container.appendChild(PreviewImage(element.sprite, this.result, this.name));
					}else{
						alert(this.name + " has wrong sizes\n you need: "+element.sprite.width+"x"+element.sprite.height);
					}
				}
				
			};
			reader.readAsDataURL(file);
		}
	}  
	   
	this.RemoveImage = function(elem){
		elem.sprite.rects.splice(elem.sprite.rects.indexOf(elem), 1);
		elem.parentNode.removeChild(elem);
		if(elem.sprite.rects.length == 0){
			elem.sprite.width = 0;
			elem.sprite.height = 0;
		}
	}
	
	this.Export = function(){
		//destroy old textures
		while (this.div.firstChild) {
			this.div.removeChild(this.div.firstChild);
		}
		
		
		var imagesRects = [];
		//add images
		for(var i = 0; i < editor.sprites.length; i++){
			Array.prototype.push.apply(imagesRects, editor.sprites[i].rects); 
		}
		
		if(imagesRects.length == 0) return;
		//atlas textures to export
		this.textures = []; 
		
		//setup rects
		for(var i = 0; i< imagesRects.length; i++){
			var rect = imagesRects[i];
			rect.fit = undefined;
			//get rect index, for the sorting
			rect.index = rect.sprite.rects.indexOf(this);
			//check rect size
			if(rect.w > this.textureSize || rect.h > this.textureSize){
				alert("image '"+rect.image.name+"' is too big for the choosen texture size ("+this.textureSize+"px)");
				return 0;
			} 
		}
		//sort and pack
		imagesRects.sort(function(a, b) {return a.area - b.area});
		var packer = new Packer(this.textureSize, this.textureSize);
    
		packer.init(this.textureSize, this.textureSize);
		packer.fit(imagesRects);
		
		var error = false;
		for(var i = 0; i< imagesRects.length; i++){
			var rect = imagesRects[i];
			if(!rect.fit)
			{
				error = true;
				break;
			}
		}
		
		if(!error)
		{
			//render   
			var canvas = document.createElement('canvas'); 
			canvas.width = this.textureSize;
			canvas.height = this.textureSize;
			canvas.ctx = canvas.getContext("2d");
			canvas.style.margin = "5px";
			canvas.style.border = "1px dotted black"; 
			this.textures.push(canvas);
			this.div.appendChild(canvas);
			  
			var offset = Math.floor(this.spacing/2);
			
			canvas.ctx.clearRect(0, 0, canvas.width, canvas.height); 
			
			 
			while(imagesRects.length > 0){
				var rect = imagesRects.pop();
				canvas.ctx.drawImage(rect.image, offset+rect.fit.x, offset+rect.fit.y);  
			}
			
			
			for(var i = 0; i < editor.sprites.length; i++){
				
				var spr = editor.sprites[i];
				spr.text = "";
				spr.text += "s "+spr.name+" "+spr.rects.length +" "+spr.width +" "+spr.height +" 0 0\n";
				
				for(var j = 0; j < spr.rects.length; j++){
					var rect = spr.rects[j];
					spr.text +=  (offset+rect.fit.x)+" "+(offset+rect.fit.y)+"\n";
				}
			}
			
			//$("output").value = str; "exported the void!";//JSON.stringify(this.verts);
			$("saveFiles").style.display = "inline";
		
		}
		else
		{
			alert("Can't complete. select a bigger texture \n There are too many sprites for this texture");
		}
	}
	
	this.ClearProject = function(){
		editor.projectSaved = true;
		//destroy old textures
		while (this.div.firstChild) {
			this.div.removeChild(this.div.firstChild);
		}
		//destroy sprites
		editor.sprites = [];
		var node = $("imagesContainer");
		while (node.firstChild) {
			node.removeChild(node.firstChild);
		}
	}
	
	this.NameExists = function(name){ 
		for(var i = 0; i < editor.sprites.length; i++){
			if(editor.sprites[i].name == name)
				return true;
		}
		return false;
	}
	 
	this.GetUniqueName = function(name){
		if(name.lastIndexOf('.') > -1)
			name = name.substr(0, name.lastIndexOf('.'));
		var id = 0;
		var result = name;
		while(this.NameExists(result)){
			result = name + id++;
		}
		return result;
	}
	
	function Rect(img){
		this.image = img;
		this.x = 0;
		this.y = 0;
		this.w = img.width+editor.spacing*2;
		this.h = img.height+editor.spacing*2;
		console.log(img,  this.w, this.h);
		this.area = this.w*this.h; 
	}
	 
	    
}
  
  

 


