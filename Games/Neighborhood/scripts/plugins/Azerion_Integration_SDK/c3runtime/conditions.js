
const C3 = globalThis.C3;

C3.Plugins.Azerion_Integration_SDK.Cnds =
{
	IsAdPlaying()
	{
		return this._isAdPlaying();
	},

	IsRewardedAvailable() {
		return this._isRewardedAvailable();
	},

	IsAdCancelled() {
		return this._isAdCancelled();
	},
	
	IsAdSkipped() {
		return this._isAdSkipped();
	}
};
