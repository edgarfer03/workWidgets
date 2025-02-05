(function()  {
	class GradeEntryForm extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({ mode: 'open' });
			this.elements = [];
			this.indexes = {};
			this._myDataSource;
		}
		
		connectedCallback() {
			console.log('from styling.js connectedCallback');
			this.render();
		}
		

		render() {
			console.log('from styling.js render');
			this.shadowRoot.innerHTML = `
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
				<div class="container">
					<h1>dimension Grade Entry</h1>
					<form id="mainFormIdxs" class="index-form">
						${this.elements.map(dimension => `
							<div class="index-num">
								<input type="number" name="${dimension[1]}" min="0" max="100" step="0.01" required>
								<label for="${dimension[0]}">${dimension[0]}</label>
							</div>
						`).join('')}
						<button type="submit">Submit Grades</button>
					</form>
					<div id="gradesSummary" class="dim-summary"></div>
				</div>
			`;
			console.log('DATABINDING', this.myDataSource)

			this.shadowRoot.querySelector('#mainFormIdxs').addEventListener('submit', this.handleFormSubmit.bind(this));
			}


		set myDataSource(dataBinding) {

			this._myDataSource = dataBinding;
			console.log('from styling.js', this._myDataSource);
			let dataBindObj = this._myDataSource.metadata;
			if (!dataBindObj) {
				return;
			}
			// check if new dimensions not already in this.elements
			const newDimensions = Object.keys(dataBindObj.dimensions).filter(key => !this.elements.map(b => b[1]).includes(dataBindObj.dimensions[key].id));
			const newMeasures = Object.keys(dataBindObj.mainStructureMembers).filter(key => !this.elements.map(b => b[1]).includes(dataBindObj.mainStructureMembers[key].id));
			console.log('newDimensions', newDimensions);
			console.log('newMeasures', newMeasures);

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

			console.log('from styling.js list', this.elements);
			this.render();
			}


		handleFormSubmit(event) {
			console.log('from styling.js handleFormSubmit');
			event.preventDefault();
			console.log('databinding outside', this.myDataSource);
			const inputs = this.shadowRoot.querySelectorAll('input[type="number"]');

			inputs.forEach(input => {
				const name = input.name;
				if (name) { 
					this.indexes[name] = input.value;  
				}
			});

			this.dispatchFormData();
		}

		dispatchFormData() {
			console.log('from styling.js dispatchFormData');
			const event = new CustomEvent('indexesUpdated', {
				detail: { indexes: this.indexes},
				bubbles: true,
				composed: true
			});
			console.log('from styling.js dispatchFormData', event);
			this.dispatchEvent(event);
		}
	}

	customElements.define('com-sap-sample-coloredbox-styling', GradeEntryForm);

})();