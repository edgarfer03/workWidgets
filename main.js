(function () {
	class KPICard extends HTMLElement {
		constructor() {
			super()
			this.attachShadow({ mode: "open" })
		}
	
		connectedCallback() {
			this.render()
		}
	
		render() {
			const title = this.getAttribute("title") || "KPI"
			const value = this.getAttribute("value") || "0"
			const description = this.getAttribute("description") || ""
	
			this.shadowRoot.innerHTML = `
			<style>
			  ${this.styles}
			</style>
			<div class="card">
			  <h3>${title}</h3>
			  <p class="value">${value}</p>
			  <p class="description">${description}</p>
			</div>
		  `
		}
	
		get styles() {
			return `
			.card {
			  background-color: rgb(255, 255, 255);
			  border-radius: 12px;
			  padding: 18px;
			  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
			  transition: all 0.3s ease;
			  cursor: pointer;
			  width: 130px;
			}
			.card:hover {
			  transform: translateY(-5px);
			  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
			}
			h3 {
			  margin: 0 0 5px 0;
			  color: #2d3748;
			  font-size: 18px;
			  font-weight: 600;
			}
			.value {
			  font-size: 28px;
			  font-weight: bold;
			  color: #4299e1;
			  margin: 0 0 8px 0;
			}
			.description {
			  font-size: 14px;
			  color: #718096;
			  margin: 0;
			}
		  `
		}
	}
	
	customElements.define("kpi-card", KPICard);
	const backgroundColor = "rgba(40, 34, 34, 0.18)";

	const template = document.createElement("template");
	template.innerHTML = `
		<style>
			#pannable-container {
				border: 1px solid #ddd;
				border-radius: 8px;
				box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
				overflow: hidden;
				position: relative;
				cursor: grab;
				width: 95%;
      			height: 95%;
				display: flex;
				justify-content: center;
				align-items: center;
				background-color: rgba(165, 160, 160, 0.21);
			}
			h2 {
				color: #2d3748;
				font-size: 24px;
				margin-bottom: 24px;
			}

			.columns {
				display: grid;
				grid-template-columns: 0fr 0fr 0fr;
				gap: 40px;
				align-items: center;
				background-color: rgba(41, 140, 206, 0);
			}

			.column {
				display: flex;
				flex-direction: column;
				background-color: rgba(177, 30, 30, 0);
				gap: 40Px;
			}

			.sub-kpis {
				justify-content: center;
			}

			.sub-kpi-container {
				display: flex;
				align-items: center;
				background-color: rgba(177, 30, 30, 0);
				gap: 8px;
			}

			.chevron {
				fill: rgba(66, 153, 225, 0);
			}

			.breakdown {
				min-height: 100%;
			}

			#lvl3 {
				display: flex;
				flex-direction: column;
				gap: 20px;
			}

			#content {
				width: 5000px;
				/* Large content area */
				height: 5000px;
				background: rgba(255, 255, 255, 0);
				position: absolute;
				display: flex;
				justify-content: center;
				align-items: center;
				top: 0px;
				left: 0px;
				background-image: 
					repeating-linear-gradient(
					90deg,               /* Horizontal lines (vertical stripes) */
					transparent,         /* Start with transparent */
					transparent 39px,    /* 49px of transparent space */
					${backgroundColor} 40px        /* 1px line at the 50px mark */
					),
					/* Create horizontal grid lines */
					repeating-linear-gradient(
					0deg,                /* Vertical lines (horizontal stripes) */
					transparent,         /* Start with transparent */
					transparent 39px,
					${backgroundColor} 40px
					);
				
				/* The grid pattern repeats every 50px in both directions */
				background-size: 40px 40px;
			}

			.kpi-tree {
				display: flex;
				flex-direction: column;
				justify-content: center;
				position: relative;
			}

			.kpi-card {
				position: relative;
			}
			.parent {
				width: 100%;
				height: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
				position: relative;
			}
			svg {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				pointer-events: none;
			}
			.zoom-buttons {
				position: absolute;
				left: 30px;
				bottom: 35px;
				display: flex;
				flex-direction: column;
				gap: 10px;
        	}
			.zoom-button {
				width: 40px;
				height: 40px;
				border: none;
				border-radius: 50%;
				background-color: white;
				box-shadow: 0 2px 5px rgba(0,0,0,0.2);
				cursor: pointer;
				display: flex;
				justify-content: center;
				align-items: center;
				transition: background-color 0.2s;
				position: relative;
			}
			.zoom-button:hover {
				background-color: #f0f0f0;
			}
			.zoom-button:focus {
				outline: none;
				box-shadow: 0 0 0 2px #4a90e2;
			}
			.zoom-icon {
				width: 24px;
				height: 24px;
				fill: #333;
			}
			#zoom-in-icon { 
				position: absolute;
				left: 8px;
				top: 8px;
			 }
			#zoom-out-icon {
				position: absolute;
				left: 8px;
				top: 8px;
			}
		</style>
		<div class="parent">
			<div id="pannable-container">
				<div id="content">
					<svg></svg>
					<div id="cardsBox"></div>
				</div>
			</div>
			<div class="zoom-buttons">
            <button class="zoom-button" id="zoomIn" aria-label="Zoom in">
                <svg class="zoom-icon" id="zoom-in-icon" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
                </svg>
            </button>
            <button class="zoom-button" id="zoomOut" aria-label="Zoom out">
                <svg class="zoom-icon" id="zoom-out-icon" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    <path d="M7 9h5v1H7z"/>
                </svg>
            </button>
        </div>
		</div>
	`;

	class ColoredBox extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({ mode: "open" }).appendChild(template.content.cloneNode(true));;
			this.dataTree = {};
			this.temp_dimensions = [];
			this.removedDimensionsHasRan = false;
			this.updateNeeded = false;
			this.selectedCard = null;
			this.lvl3active = false;
			this.scale = 1;
			document.addEventListener('updateNeeded', () => {
				this.updateNeeded = true;
				console.log('updateNeeded event received');
			});
			this.render();
			this.addEventListeners();
			console.log('constructor done');

		}

		async onCustomWidgetResize(width, height) {
			console.log('onCustomWidgetResize', width, height);
		}

		async removeDimensions(dimensions) {
			console.log('removeDimensions');
			this.temp_dimensions = this.dataBindings.getDataBinding('myDataSource').getDimensions('dimensions'); // Store dimensions in List

			// store DataBinding by pushing to properties
			this.dispatchEvent(new CustomEvent("propertiesChanged", {
				detail: {
					properties: {
						pastDB: this.myDataSource
					}
				}
			}));
			console.log('pastDB pushed to properties', this.myDataSource);
	
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
			this.removedDimensionsHasRan = true;
		}

		async onCustomWidgetAfterUpdate(changedProperties) {
			console.log('onCustomWidgetAfterUpdate', changedProperties);

			// triggers process to update dataTree. This will change the dataBindings and then trigger onCustomWidgetAfterUpdate again. 
			// so, we return here and let the next run of onCustomWidgetAfterUpdate to handle the dataBindings and update the dataTree
			if (('myCardIdxs' in changedProperties) && (this.updateNeeded)) {
				this.updateNeeded = false;
				// this should run after dispatch from comes from styling.js
				console.log('myCardIdxs is in changedProperties and updateNeeded is true. So we should update the dataTree');
				// removing dimensions will trigger onCustomWidgetAfterUpdate again and then myDataSource in changedProperties will be true
				this.removeDimensions(this.dataBindings.getDataBinding('myDataSource').getDimensions('dimensions'));
				return;
			}
			if ('myDataSource' in changedProperties) {
				console.log('myDataSource is in changedProperties');
				if (this.removedDimensionsHasRan && this.myDataSource.state === "success" && Object.keys(this.myDataSource.metadata.dimensions).length == 0) {
					console.log('dimensions have been removed. HERE :)');
					console.log('DataBindings should have only the measures here', this.myDataSource);
					this.removedDimensionsHasRan = false;

					let dataBindingMetadata = this.myDataSource.metadata;

					let measuresAndDimensions = this.myCardIdxs;
					this.dataTree['bucket'] = [];

					for (const [id, chainId] of Object.entries(measuresAndDimensions)) {
						console.log(`${id}: ${chainId}`);
						if (Object.entries(dataBindingMetadata.mainStructureMembers).map(([key, value]) => value.id).includes(id)) {
							const codeName = Object.entries(dataBindingMetadata.mainStructureMembers).filter(([key, value]) => value.id == id).map(([key, value]) => key)[0];
							const parentId = chainId.includes('.') ? chainId.split('.').slice(0, -1).join('.') : null;

							const cardContent = {
								"type": "measure",
								"label": dataBindingMetadata.mainStructureMembers[codeName].label,
								"id": id,
								"value": this.myDataSource.data[0][codeName].raw,
								"chainId": chainId,
								"parentId": parentId,
								"children": []
							};

							this.dataTree['bucket'].push(cardContent);

							// add chainId to children property of parent card
							if (parentId) {
								const parentCard = this.dataTree['bucket'].find(card => card.chainId == parentId);
								parentCard.children.push(chainId);
							}
						} else if (Object.entries(dataBindingMetadata.dimensions).map(([key, value]) => value.id).includes(id)) {
							const codeName = Object.entries(dataBindingMetadata.dimensions).filter(([key, value]) => value.id == id).map(([key, value]) => key)[0];
							const cardContent = {
								"type": "dimension",
								"label": dataBindingMetadata.dimensions[codeName].description,
								"id": id,
								"chainId": chainId,
								"parentId": null,
								"children": null
							};

							this.dataTree['bucket'].push(cardContent);
						}
					}
					// Save DataTree to Properties
					this.dispatchEvent(new CustomEvent("propertiesChanged", {
						detail: {
							properties: {
								measuresDB: this.dataTree['bucket']
							}
						}
					}));

					const self = this;
					for (const dimension of this.temp_dimensions) {
						try {
							await self.dataBindings.getDataBinding('myDataSource').addDimensionToFeed('dimensions', dimension);
							console.log(`Dimension ${dimension} added successfully.`);
						} catch (error) {
							console.error(`Error adding dimension ${dimension}:`, error);
							// Handle or continue based on your needs
						}
					}
					return; // we return because when the columns are restored in dataBindings, onCustomWidgetAfterUpdate will run again and we don't want this.render() to run twice

				}
			}
			// and dataTree should have data. TODO later
			if (!this.updateNeeded) {
				this.render();
			}
		}
		moveToInitialPosition() { 
			console.log('moveToInitialPosition');
			this.shadowRoot.getElementById("content").style.top = '-2200px';
			this.shadowRoot.getElementById("content").style.left = '-2200px';
		}

		render() {
			console.log('render main');
			const parent = this.shadowRoot.querySelector('#cardsBox');
			parent.innerHTML = `
					<div class="columns">
						<div class="column">
							<kpi-card class="main-kpi" title="Profitability" value="15%"
								description="Overall profitability"></kpi-card>
						</div>
						<div class="column sub-kpis">
							<kpi-card class="sub-kpi" title="Net Profit" value="$500K"
								description="Total net profit"></kpi-card>
							<kpi-card class="sub-kpi" title="Revenue" value="$3.33M" description="Total revenue"></kpi-card>
							<kpi-card class="sub-kpi" title="Revenue2" value="$3.33M" description="Total revenue"></kpi-card>

						</div>
						<div id="lvl3" class="column breakdown"></div>
					</div>`;

			this.moveToInitialPosition(); 
			if (this.selectedCard == null) {this.handleCardClick(null);}
			this.addEventListeners();
			
		}
		// now for the drawing of the asset. PRevious code was mainly to prepare the data
		connectedCallback() {
			console.log('connectedCallback');
			this.render();

		}

		addEventListeners() {
			console.log('addEventListeners');

			window.addEventListener('resize', () => this.drawLines());

			this.shadowRoot.querySelectorAll(".sub-kpi").forEach((card) => {
				card.addEventListener("click", (e) => this.handleCardClick(e.target))
			});

			const container = this.shadowRoot.getElementById("pannable-container");
			const content = this.shadowRoot.getElementById("content");
			const zoomInButton = this.shadowRoot.getElementById("zoomIn");
			const zoomOutButton = this.shadowRoot.getElementById("zoomOut");

			let isPanning = false;
			let startX, startY, scrollLeft, scrollTop;
			let scale = 1;

			// Mouse Down Event
			container.addEventListener("mousedown", (e) => {
				isPanning = true;
				startX = e.clientX;
				startY = e.clientY;
				scrollLeft = content.offsetLeft;
				scrollTop = content.offsetTop;
				container.style.cursor = "grabbing";
			});

			// Mouse Move Event
			container.addEventListener("mousemove", (e) => {
				if (!isPanning) return;
				e.preventDefault();

				const dx = e.clientX - startX;
				const dy = e.clientY - startY;

				content.style.left = `${scrollLeft + dx}px`;
				content.style.top = `${scrollTop + dy}px`;
			});

			// Mouse Up Event
			container.addEventListener("mouseup", () => {
				isPanning = false;
				container.style.cursor = "grab";
			});

			// Prevent Text Selection
			container.addEventListener("mouseleave", () => {
				isPanning = false;
				container.style.cursor = "grab";
			});

			container.addEventListener("wheel", (e) => {
				e.preventDefault();

				const zoomIntensity = 0.01; // How much to zoom on each scroll
				const delta = e.deltaY > 0 ? -1 : 1; // Zoom in or out based on scroll direction
				const oldScale = this.scale;

				// Update scale
				this.scale += delta * zoomIntensity;
				this.scale = Math.min(Math.max(0.5, this.scale), 1.5); // Clamp scale between 0.5x and 3x

				// Calculate the mouse position relative to the content
				const rect = content.getBoundingClientRect();
				const mouseX = e.clientX - rect.left;
				const mouseY = e.clientY - rect.top;

				// Adjust content's position to keep the zoom centered around the mouse
				content.style.transformOrigin = `${mouseX}px ${mouseY}px`;
				content.style.transform = `scale(${this.scale})`;
			});
			zoomInButton.addEventListener('click', () => {
				this.scale *= 1.1;
				this.scale = Math.min(Math.max(0.5, this.scale), 1.5);
				content.style.transform = `scale(${this.scale})`;

			});
			zoomOutButton.addEventListener('click', () => {
				this.scale /= 1.1;
				this.scale = Math.min(Math.max(0.3, this.scale), 1.5);
				content.style.transform = `scale(${this.scale})`;
			});

		}

		handleCardClick(card) {
			console.log('handleCardClick');

			const breakdownColumn = this.shadowRoot.querySelector(".breakdown")
			const mainKpi = this.shadowRoot.querySelector(".main-kpi");
			let previous_mainkpiY = mainKpi.getBoundingClientRect().top;

			breakdownColumn.innerHTML = "";


			if (this.selectedCard === card) {
				this.selectedCard = null;
				this.lvl3active = false;
				this.drawLines();
				let diffY = mainKpi.getBoundingClientRect().top - previous_mainkpiY;
				let distance = Number(this.shadowRoot.getElementById("content").style.top.replace('px', '')) - diffY;
				this.shadowRoot.getElementById("content").style.top = `${distance}px`;
				return
			}

			this.selectedCard = card
			const title = card.getAttribute("title")

			if (title === "Revenue") {
				breakdownColumn.innerHTML = `
			<kpi-card title="North America" value="$1.4M" description="Revenue from North America"></kpi-card>
			<kpi-card title="Europe" value="$1M" description="Revenue from Europe"></kpi-card>
			<kpi-card title="Asia" value="$833K" description="Revenue from Asia"></kpi-card>
			<kpi-card title="Asiania" value="$803K" description="Revenue from ania"></kpi-card>
					<kpi-card title="Asiania" value="$803K" description="Revenue from ania"></kpi-card>
			<kpi-card title="Asiania" value="$803K" description="Revenue from ania"></kpi-card>
			<kpi-card title="Asiania" value="$803K" description="Revenue from ania"></kpi-card>
			<kpi-card title="Asiania" value="$803K" description="Revenue from ania"></kpi-card>
	
			`
				this.lvl3active = true;


			} else if (title === "Net Profit") {
				breakdownColumn.innerHTML = `
			<kpi-card title="Op Profit" value="$600K" description="Operating profit"></kpi-card>
			<kpi-card title="Taxes" value="$100K" description="Taxes paid"></kpi-card>
			`
			}


			let diffY = mainKpi.getBoundingClientRect().top - previous_mainkpiY;
			let distance = Number(this.shadowRoot.getElementById("content").style.top.replace('px', '')) - diffY;
			this.shadowRoot.getElementById("content").style.top = `${distance}px`;

			this.animateBreakdown(breakdownColumn)
			this.drawLines();
		}

		animateBreakdown(breakdownColumn) {
			console.log('animateBreakdown');
			breakdownColumn.style.opacity = "0"
			breakdownColumn.style.transform = "translateX(20px)"
			setTimeout(() => {
				breakdownColumn.style.transition = "opacity 0.3s ease, transform 0.3s ease"
				breakdownColumn.style.opacity = "1"
				breakdownColumn.style.transform = "translateX(0)"
			}, 50)
		}


		drawLines() {
			console.log('drawLines');
			const svg = this.shadowRoot.querySelector('svg');
			const mainKpi = this.shadowRoot.querySelector('.main-kpi');
			const subKpis = this.shadowRoot.querySelectorAll('.sub-kpi');

			if (!mainKpi || subKpis.length === 0) { console.log('No main kpi or sbkpi length is zero. Drawlines exited', mainKpi, subKpis); return};

			const mainRect = mainKpi.getBoundingClientRect();
			const svgRect = svg.getBoundingClientRect();

			svg.innerHTML = ''; // Clear previous lines

			// Create a linear gradient definition
			const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
			const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
			gradient.setAttribute("id", "gradientStroke");
			gradient.setAttribute("x1", "0%");
			gradient.setAttribute("y1", "0%");
			gradient.setAttribute("x2", "100%");
			gradient.setAttribute("y2", "0%");

			// Add gradient stops
			const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			stop1.setAttribute("offset", "0%");
			stop1.setAttribute("stop-color", "#4299e1");
			stop1.setAttribute("stop-opacity", "0.2"); // More transparent
			gradient.appendChild(stop1);

			const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			stop2.setAttribute("offset", "100%");
			stop2.setAttribute("stop-color", "#4299e1");
			stop2.setAttribute("stop-opacity", "1"); // Fully opaque
			gradient.appendChild(stop2);

			// Append the gradient to the defs section
			defs.appendChild(gradient);
			svg.appendChild(defs);

			const drawPath = (mainBox, subBoxes) => {
				const startx = (mainBox.right - svgRect.left) / this.scale;
				const starty = ((mainBox.top - svgRect.top) + mainBox.height / 2) / this.scale;


				subBoxes.forEach(subKpi => {
					const subRect = subKpi.getBoundingClientRect();
					const pathData = `M ${startx} ${starty}
								 C ${(subRect.left - svgRect.left + 1) / this.scale} ${starty + 1} 
								 ${startx - 16} ${(subRect.top - svgRect.top + subRect.height / 2) / this.scale} 
								 ${(subRect.left - svgRect.left) / this.scale} ${(subRect.top - svgRect.top + subRect.height / 2) / this.scale}`;

					// Create and append the path element
					const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
					path.setAttribute("d", pathData);
					path.setAttribute("stroke", "url(#gradientStroke)");
					path.setAttribute("fill", "none");
					path.setAttribute("stroke-width", "6");
					svg.appendChild(path);

				});
			}

			drawPath(mainRect, subKpis);
			const lvl3Kpis = this.shadowRoot.querySelector('.breakdown').querySelectorAll('kpi-card');


			if (this.selectedCard != null) {
				drawPath(this.selectedCard.getBoundingClientRect(), lvl3Kpis);
			}
		}


	}

	customElements.define("com-sap-sample-coloredbox", ColoredBox);
})();