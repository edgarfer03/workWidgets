(function () {
	const template = document.createElement('template');
	template.innerHTML = `
				<style>
					:host {
						font-family: 'Arial', sans-serif;
						background-color: #f0f4f8;
						display: flex;
						justify-content: center;
						align-items: center;
						min-height: 100vh;
						margin: 0;
					}
					.container {
						padding: 2rem;
						width: 100%;
						max-width: 500px;
					}
					h1 {
						color: #2c3e50;
						margin-bottom: 1.5rem;
					}
					.index-form {
						display: grid;
						gap: 1rem;
					}
					.index-num {
						display: grid;
						grid-template-columns: auto 1fr;
						align-items: center;
						gap: 1rem;
					}
					label {
						font-weight: bold;
						color: #34495e;
					}
					input[type="number"] {
						width: 60px;
						padding: 0.5rem;
						border: 1px solid #bdc3c7;
						border-radius: 4px;
						font-size: 1rem;
					}
					button {
						background-color: #3498db;
						color: white;
						border: none;
						padding: 0.75rem 1rem;
						font-size: 1rem;
						border-radius: 4px;
						cursor: pointer;
						transition: background-color 0.3s ease;
					}
					button:hover {
						background-color: #2980b9;
					}
					.dim-summary {
						margin-top: 1.5rem;
						padding-top: 1.5rem;
						border-top: 1px solid #ecf0f1;
					}
				</style>
				<div class="container" id="mainFormContainer">

				</div>
			`;

	class IndexEntryForm extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
			this.elements = [];
			this.indexes = {};
			console.log('from styling.js constructor done');
		}

		connectedCallback() {
			console.log('from styling.js connectedCallback. render will be called');
			this.render();
		}


		render() {
			console.log('from styling.js render but it is empty');
		}


		set myDataSource(dataBinding) {
			console.log('from styling.js set myDataSource. this should maintain in sync the databindings in the model and this.elements. After making sure they are in sync drawInputFields is called');

			this._myDataSource = dataBinding;
			let dataBindObj = this._myDataSource.metadata;
			if (!dataBindObj) {
				return;
			}
			// check if new dimensions not already in this.elements
			const newDimensions = Object.keys(dataBindObj.dimensions).filter(key => !this.elements.map(b => b[1]).includes(dataBindObj.dimensions[key].id));
			const newMeasures = Object.keys(dataBindObj.mainStructureMembers).filter(key => !this.elements.map(b => b[1]).includes(dataBindObj.mainStructureMembers[key].id));
			newDimensions.forEach((key) => {
				this.elements.push([dataBindObj.dimensions[key].description, dataBindObj.dimensions[key].id]);
			})
			newMeasures.forEach((key) => {
				this.elements.push([dataBindObj.mainStructureMembers[key].label, dataBindObj.mainStructureMembers[key].id]);
			});

			// remove dimensions that are not in dataBinding anymore
			this.elements = this.elements.filter(([description, id]) => {
				return Object.keys(dataBindObj.dimensions).map(codeName => dataBindObj.dimensions[codeName].id).includes(id)
					|| Object.keys(dataBindObj.mainStructureMembers).map(codeName => dataBindObj.mainStructureMembers[codeName].id).includes(id);
			});

			console.log('from styling.js. (still inside set MyDataSource) this.elements: ', this.elements);
			this.drawInputFields();
		}

		drawInputFields() {
			console.log('from styling.js drawInputFields');
			console.log('(inside drawInputFields) this.myCardIdxs', this.myCardIdxs);

			this.shadowRoot.querySelector('#mainFormContainer').innerHTML = `<h1>Tree card indexes</h1>
						<form class="index-form" onsubmit="return false;">
						${this.elements.map(dimension => `
							
							<div class="index-num">
								<input type="number" name="${dimension[1]}" min="0" max="100" step="0.01" required>
								<label for="${dimension[0]}">${dimension[0]}</label>
							</div>
							
						`).join('')}
							<button id="bt209" type="button">Draw Visual</button>
						</form>

					`;
			this.shadowRoot.querySelector('#bt209').addEventListener('click', (event) => {
				event.preventDefault(); console.log('event', event);
				this.handleFormSubmit();
			});


			let list_of_dimensions = this.elements.map(dimension => dimension[1]);
			for (let dimension of list_of_dimensions) {
				if (this.myCardIdxs[dimension] != undefined) {
					this.shadowRoot.querySelector(`input[name="${dimension}"]`).value = this.myCardIdxs[dimension];
				}
			}
		}

		handleFormSubmit() {
			console.log('from styling.js handleFormSubmit. This should update the indexes object and dispatch a custom event with new myCardIdxs property');
			const inputs = this.shadowRoot.querySelectorAll('input[type="number"]');
			inputs.forEach(input => {
				const name = input.name;
				if (name) {
					this.indexes[name] = input.value;
				}

			});

			// notify that new indexes are available, and dataTree must be updated (this is to separate between normal bootup and update)
			this.dispatchEvent(new CustomEvent('updateNeeded', {
				detail: { updateNeeded: true},
				bubbles: true,
				composed: true
			}));

			// update myCardIdxs property with new indexes
			this.dispatchEvent(new CustomEvent("propertiesChanged", {
				detail: {
					properties: {
						myCardIdxs: this.indexes
					}
				}
			}));
		}
	}

	customElements.define('com-sap-sample-coloredbox-styling', IndexEntryForm);

})();