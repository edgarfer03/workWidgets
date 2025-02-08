(function() { 


	class ColoredBox extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({mode: "open"});
			this.addEventListener("click", event => {
				var event = new Event("onClick");
				this.dispatchEvent(event);
			});
			this._props = {};
			this.drawFlag = false; // Flag to check if the draw function has been called
			/*document.addEventListener('indexesUpdated', (e) => {
				console.log('EVENT RECEIVED');
				console.log(e.detail.indexes);
				this.cardIndexes = e.detail.indexes;
				this.updateNeeded = true;
				this.removeDimensions(this.dataBindings.getDataBinding('myDataSource').getDimensions('dimensions'));
				this.render();
			});*/
			this.dataTree = {};
			this.updateNeeded = false;
			this.temp_dimensions = [];
		}

		async onCustomWidgetResize (width, height) {
			console.log('onCustomWidgetResize', width, height);
			/*
			let sthg = this.dataBindings.getDataBinding('myDataSource').removeDimension('REGION_LEVEL_02_DESC');
			console.log('STHG', typeof sthg, sthg);
			sthg.then(() => console.log('AFTER STHG', this.myDataSource));*/
		  }

		async removeDimensions(dimensions) {
			this.temp_dimensions = this.dataBindings.getDataBinding('myDataSource').getDimensions('dimensions'); // Store dimensions in List

			const self = this;
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
			this.drawFlag = true;
		}
		
		
		onCustomWidgetBeforeUpdate(changedProperties) {
			console.log('onCustomWidgetBeforeUpdate', changedProperties);
			this._props = { ...this._props, ...changedProperties };
		}

		async onCustomWidgetAfterUpdate(changedProperties) {
			console.log('onCustomWidgetAfterUpdate', changedProperties);
			this._props = { ...this._props, ...changedProperties };
			console.log('myDataSource' in changedProperties);
			console.log('this.DrawFlag', this.drawFlag);
			console.log('mydatasource status', this.myDataSource);

			if ("color" in changedProperties) {
				this.style["background-color"] = changedProperties["color"];
			}
			if ('myDataSource' in changedProperties) { 
				console.log('myDataSource is in changedProperties');
				if (this.drawFlag && this.myDataSource.state === "success" && Object.keys(this.myDataSource.metadata.dimensions).length == 0) {
					console.log('dimensions have been removed. HERE :)')
					console.log('temp_dimensions', this.temp_dimensions);

					const self = this;
					for (const dimension of this.temp_dimensions) {
						try {
							await self.dataBindings.getDataBinding('myDataSource').addDimensionToFeed('dimensions', dimension);
							console.log(`Dimension ${dimension} removed successfully.`);
						} catch (error) {
							console.error(`Error removing dimension ${dimension}:`, error);
							// Handle or continue based on your needs
						}
					}

			}}
			
			this.render();
		}


		
		render() {
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
			/*
			if (this.updateNeeded){
				let temp_dimensions= this.dataBindings.getDataBinding('myDataSource').getDimensions('dimensions'); // Store dimensions in List
				console.log('This', this);
				let self = this;
				console.log('self', self);
				console.log('temp_dimensions before', temp_dimensions);


				console.log('this.myDataSource from render', this.myDataSource);

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
			
			this.updateNeeded = false;*/
		}
		
		
	}

	customElements.define("com-sap-sample-coloredbox", ColoredBox);
})();