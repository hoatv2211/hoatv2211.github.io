

const scriptsInEvents = {

	async Esplashqky_Event1_Act4(runtime, localVars)
	{
		document.body.style.backgroundColor = '#168D4C'
	},

	async Esplashqky_Event1_Act9(runtime, localVars)
	{
		if (window.hasOwnProperty('_azCheckOrientation')) {
			window['_azCheckOrientation']();
		}
	},

	async Emenu_Event2_Act3(runtime, localVars)
	{
		document.body.style.backgroundColor = '#168D4C'
	},

	async Azerionintegration_Event3_Act7(runtime, localVars)
	{
		if (window.hasOwnProperty('_azerionIntegration') && window['_azerionIntegration']['advType'] == 'gd') {
			runtime.globalVars.PREROLL_ENABLED = 1;
		}
	},

	async Azerionintegration_Event8_Act2(runtime, localVars)
	{
		const ua = navigator.userAgent;
		const ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
		const iphone = ua.match(/(iPhone\sOS)\s([\d_]+)/);
		const enable = !(ipad || iphone)
		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState) {
				  //This is a fix for handling visibility change on webview, it's for an issue reported for Samsung App
				  if (document.visibilityState === 'hidden') {
				  runtime.callFunction('PauseGame');
					
				  }
				  if (document.visibilityState === 'visible') {
					  runtime.callFunction('ResumeGame');
				  }
			}
		});
				window.addEventListener('blur', () => {		
					runtime.callFunction('OnBlur');
			})
			
			window.addEventListener('focus', () => {		
				runtime.callFunction('OnFocus');
			})
	},

	async Azerionintegration_Event8_Act3(runtime, localVars)
	{
		try {
			if(window.hasOwnProperty('_azExtraAdListener')) {
				_azExtraAdListener();
			}
		} catch(event) {
			console.log("[az c3 extra] Error in extra listener", event);
		}
	},

	async Azerionintegration_Event22_Act1(runtime, localVars)
	{
		
	},

	async Azerionintegration_Event22_Act3(runtime, localVars)
	{
		const ua = navigator.userAgent;
		const iphone = /iPhone/i.test(ua);
		const versionMatch = ua.match(/OS (\d+)_\d+/);
		const iOSVersion = versionMatch ? parseInt(versionMatch[1], 10) : 0;
		
		if (iphone) {
				try {
					setTimeout(async () => {
						await runtime.objects.Audio.audioContext.suspend();
						await runtime.objects.Audio.audioContext.resume();
						console.log("For iOS_18 trying to reset audio after focus loss");
						runtime.callFunction('ResumeGame');
					}, 800);
				} catch (error) {
					console.log('Error in before project');
				}
		} else {
					console.log('Regain custom focus');
					runtime.callFunction('ResumeGame');
		}
	},

	async Azerionintegration_Event23_Act2(runtime, localVars)
	{
		
	},

	async Azerionintegration_Event23_Act3(runtime, localVars)
	{
		const ua = navigator.userAgent;
		const iphone = /iPhone/i.test(ua);
		const versionMatch = ua.match(/OS (\d+)_\d+/);
		const iOSVersion = versionMatch ? parseInt(versionMatch[1], 10) : 0;
		if (iphone) {
			if (iOSVersion < 18) {
				try {
					await runtime.objects.Audio.audioContext.suspend();
				} catch (error) {
					console.log('Could not suspend and resume for iOS 17 or lower')
				}
		
			}
			runtime.callFunction('PauseGame');
			console.log("Audio context suspended (Custom Blur)");			
		} else {
			runtime.callFunction('PauseGame');
		}
		
				
	}
};

globalThis.C3.JavaScriptInEvents = scriptsInEvents;
