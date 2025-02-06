(function() { 
;

	class ColoredBox extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({mode: "open"});
			this.addEventListener("click", event => {
				var event = new Event("onClick");
				this.dispatchEvent(event);
			});
			this._props = {};
			document.addEventListener('indexesUpdated', (e) => {
				console.log('EVENT RECEIVED');
				console.log(e.detail.indexes);
				this.cardIndexes = e.detail.indexes;
				this.updateNeeded = true;
				this.render();
			});
			this.dataTree = {};
			this.updateNeeded = false;
		}

		onCustomWidgetResize (width, height) {
			console.log('onCustomWidgetResize', width, height);
			let sthg = this.dataBindings.getDataBinding('myDataSource').removeDimension('REGION_LEVEL_02_DESC');
			console.log('STHG', typeof sthg, sthg);
			sthg.then(() => console.log('AFTER STHG', this.myDataSource));
		  }
		  
		/*
		onCustomWidgetBeforeUpdate(changedProperties) {
			console.log('onCustomWidgetBeforeUpdate', changedProperties);
			this._props = { ...this._props, ...changedProperties };
		}*/

		onCustomWidgetAfterUpdate(changedProperties) {
			console.log('onCustomWidgetAfterUpdate', changedProperties);
			this._props = { ...this._props, ...changedProperties };

			if ("color" in changedProperties) {
				this.style["background-color"] = changedProperties["color"];
			}
			if ("opacity" in changedProperties) {
				this.style["opacity"] = changedProperties["opacity"];
			}
			
			this.render();
		}

		async render() {
			console.log('RENDER');
			let dataBindingMetadata = this.myDataSource.metadata;
			console.log('DATA BINDING METADATA from render main', dataBindingMetadata);

			this.shadowRoot.innerHTML = `
				<style>
				:host {
					border-radius: 25px;
					border-width: 4px;
					border-color: black;
					border-style: solid;
					display: block;
				} 
				</style>
				<form id="mainFormIdxs" class="index-form">
					<textarea id="customCode" rows="5" cols="60"></textarea>
					<button type="submit">Submit Grades</button>
				</form>
			`;

			if (this.updateNeeded){
				let temp_dimensions= this.dataBindings.getDataBinding('myDataSource').getDimensions('dimensions'); // Store dimensions in List
				console.log('This', this);
				let self = this;
				console.log('self', self);
				console.log('temp_dimensions before', temp_dimensions);

				async function removeDimensions(dimensions) {
					for (const dimension of dimensions) {
						try {
							// Await each removal to ensure the previous one completes first
							await self.dataBindings.getDataBinding('myDataSource').removeDimension(dimension);
							console.log(`Dimension ${dimension} removed successfully.`);
						} catch (error) {
							console.error(`Error removing dimension ${dimension}:`, error);
							// Handle or continue based on your needs
						}
					}
					console.log('dimensions', self.dataBindings.getDataBinding('myDataSource').getDimensions('dimensions'));
				}
				console.log('this.myDataSource from render', this.myDataSource);

				async function waitForDataBinding() {
					while ( this.myDataSource.status !== "success") {
					  await new Promise((resolve) => setTimeout(resolve, 800)); 
					  console.log("Waiting for data binding to be ready...", this.myDataSource);
					}
					console.log("Data binding is ready:", this.dataBinding);
				  }
				  
				removeDimensions(temp_dimensions).then(() => {waitForDataBinding()}).then(() => {
					console.log('Dimensions removal process complete');
					console.log('this.cardIndexes', this.cardIndexes);
					
					const filteredSortedAssets = Object.entries(this.cardIndexes).map(([key, value]) => [key, parseFloat(value)]).sort((a, b) => a[1] - b[1]);

					console.log('FILTERED SORTED LVL2 ', filteredSortedAssets);
					this.dataTree['manualInput'] = [];
					this.dataTree['structuredTree'] = {};
					this.dataTree['dimensionBreakdown'] = [];
					let lastLvl = 0.1;
					console.log('this.myDataSiurce from render', this.myDataSource);

					

					for (let [id, assignedLevel] of filteredSortedAssets) {
						console.log('id', id);
						if (Object.entries(dataBindingMetadata.mainStructureMembers).map(([key, value]) => value.id).includes(id)){
							let codeName = Object.entries(dataBindingMetadata.mainStructureMembers).filter(([key, value]) => value.id == id).map(([key, value]) => key)[0];
							console.log(`code name ${codeName} for id ${id}. Label: ${dataBindingMetadata.mainStructureMembers[codeName].label}`);

							let cardContent = {
								"codeName": codeName,
								"label": dataBindingMetadata.mainStructureMembers[codeName].label,
								"id": id,
								"value": this.myDataSource.data[0][codeName].raw,
								"level": assignedLevel
							};

							this.dataTree['manualInput'].push(cardContent);

							let lvl;
							if (Number.isInteger(assignedLevel)){
								lvl = Math.floor(assignedLevel + lastLvl)
							} else {
								lvl = Math.floor(assignedLevel + Math.floor(lastLvl))
							}
							console.log(Object.keys(this.dataTree['structuredTree']));
							if (!Object.keys(this.dataTree['structuredTree']).includes(String(lvl))){
								console.log('creating new level', lvl);
								this.dataTree['structuredTree'][lvl] = [];
							}

							this.dataTree['structuredTree'][lvl].push(cardContent);
							console.log('card added to lvl', lvl, cardContent);

							lastLvl = assignedLevel;

						} else if (Object.entries(dataBindingMetadata.dimensions).map(([key, value]) => value.id).includes(id)){
							console.log('DIMENSION');
							let cLvl = Object.keys(this.dataTree['structuredTree']).sort().reverse()[0] + 1;
							console.log('LAST LEVEL', lastLvl);

							let codeName = Object.entries(dataBindingMetadata.dimensions).filter(([key, value]) => value.id == id).map(([key, value]) => key)[0];

							let cardContent = {
								"codeName": codeName,
								"label": dataBindingMetadata.dimensions[codeName].description,
								"id": id,
								"level": cLvl
							};
							this.dataTree['dimensionBreakdown'].push(cardContent);
						}

					}

					console.log('DATA TREE', this.dataTree);
					console.log('temp_dimensions after', temp_dimensions);
					temp_dimensions.forEach(dimension => {
						this.dataBindings.getDataBinding('myDataSource').addDimensionToFeed('dimensions', dimension);

					});
					}).catch(error => {
					// Handle any errors during the removal process
					console.error('Error removing dimensions:', error);
					});

				//this.dataBindings.getDataBinding('dataBinding').removeDimension("INTERNAL_ACCOUNT_CLASSIFICATION").then(console.log('HHHH', this.dataBinding))
			}

			this.shadowRoot.querySelector('#mainFormIdxs').addEventListener('submit', () => {
				eval(this.shadowRoot.querySelector('#customCode').value);
			});
			
			this.updateNeeded = false;
		}
		
		
	}

	customElements.define("com-sap-sample-coloredbox", ColoredBox);
})();