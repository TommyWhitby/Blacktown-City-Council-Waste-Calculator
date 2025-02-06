import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { DEVELOPMENT_TYPES, createCalculator } from './developmentTypes.js';

        class BinCalculator extends LitElement {
            static styles = css`
        :host {
            display: block;
            color: white;
            background: transparent;
            padding: 0.5rem;
        }
        nav {
            display: flex;
            margin-bottom: 0.5rem;
            gap: 0.25rem;
        }
        nav > ::slotted([slot="tab"]) {
            padding: 0.5rem 0.75rem;
            flex: 1 1 auto;
            color: white;
            border-bottom: 2px solid lightgrey;
            text-align: center;
            cursor: pointer;
            background: none;
            border: 1px solid #ccc;
            margin: 0;
            font-size: 0.9rem;
            line-height: 1.2;
            word-wrap: break-word;
        }
        nav > ::slotted([slot="tab"][selected]) {
            border-color: white;
            background: rgba(255, 255, 255, 0.1);
        }
        ::slotted([slot="panel"]) {
            display: none;
            padding: 1rem;
            color: white;
        }
        ::slotted([slot="panel"][selected]) {
            display: block;
        }
        .calculator-form {
            display: grid;
            gap: 1rem;
            max-width: 600px;
            margin: 0 auto;
        }
        .form-group {
            display: grid;
            gap: 0.5rem;
        }
        input, select {
            padding: 0.5rem;
            border: 1px solid #ccc;
            border-radius: 4px;
            background: rgb(68, 115, 143);
            color: white;
        }
        .results {
            margin-top: 1rem;
            padding: 1rem;
            border: 1px solid #ccc;
            border-radius: 4px;
            background: rgb(68, 115, 143);
        }
        `;

            static properties = {
                calculators: { type: Object },
                currentCalculator: { type: Object },
                currentType: { type: String }
            };

            constructor() {
                super();
                this.calculators = {};
                this.initializeCalculators();
            }

            initializeCalculators() {
                Object.values(DEVELOPMENT_TYPES).forEach(type => {
                    this.calculators[type] = createCalculator(type);
                });
            }
        
            firstUpdated() {
                this._tabs = Array.from(this.querySelectorAll("[slot=tab]"));
                this._panels = Array.from(this.querySelectorAll("[slot=panel]"));
                if (this._tabs.length > 0) {
                    this.selectTab(0);
                }
            }

            selectTab(tabIndex) {
                if (!this._tabs || !this._panels) return;
                
                this._tabs.forEach((tab) => tab.removeAttribute("selected"));
                this._tabs[tabIndex]?.setAttribute("selected", "");
                
                this._panels.forEach((panel) => panel.removeAttribute("selected"));
                this._panels[tabIndex]?.setAttribute("selected", "");
        
                // Set current calculator based on tab
                this.currentType = Object.values(DEVELOPMENT_TYPES)[tabIndex];
                this.currentCalculator = this.calculators[this.currentType];
            }
        
            handleSelect(e) {
                const index = this._tabs?.indexOf(e.target);
                if (index !== -1) {
                    this.selectTab(index);
                    this.requestUpdate();
                }
            }
        
            handleInputChange(e, property) {
                if (this.currentCalculator) {
                    this.currentCalculator[property] = e.target.type === 'number' 
                        ? Number(e.target.value) 
                        : e.target.type === 'checkbox' 
                            ? e.target.checked 
                            : e.target.value;
                    this.currentCalculator.calculate();
                    this.requestUpdate();
                }
            }

            // ################################## NO. OF COLLECTIONS PER WEEK / FORTNIGHT CURRENTLY DOES NOT DO ANYTHING, NEED TO ADD
        
            renderCalculatorForm() {
                if (!this.currentCalculator) return html``;
        
                return html`
                    <div class="calculator-form">
                        <div class="form-group">
                            <label>Number of units/dwellings</label>
                            <input 
                                type="number" 
                                min="1"
                                .value=${this.currentCalculator.numberOfUnits}
                                @input=${(e) => this.handleInputChange(e, 'numberOfUnits')}
                            >
                        </div>

                        ${this.currentCalculator.calculatorNo === 2  || this.currentCalculator.calculatorNo === 3 || this.currentCalculator.calculatorNo === 4 || this.currentCalculator.calculatorNo === 5 ? html`
                        <div class="form-group">
                            <label>Seniors Housing?</label>
                            <select @change=${(e) => this.handleInputChange(e, 'isSeniorsHousing')}>
                                <option value="false">No</option>
                                <option value="true">Yes</option>
                            </select>
                        </div>
                        ` : ''}
        
                        ${this.currentCalculator.collectionType === 'Onsite' ? html`
                            <div class="form-group">
                                <label>Use 1:2 Compaction?</label>
                                <select @change=${(e) => this.handleInputChange(e, 'hasCompaction')}>
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </select>
                            </div>
                        ` : ''}

                        ${this.currentCalculator.calculatorNo === 4  || this.currentCalculator.calculatorNo === 5 || this.currentCalculator.calculatorNo === 7 || this.currentCalculator.calculatorNo === 9 ? html`
                        <div class="form-group">
                            <label>No. of collections per week</label>
                            <select @change=${(e) => this.handleInputChange(e, '')}> 
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                            </select>
                        </div>
                        ` : ''}

                        ${this.currentCalculator.calculatorNo === 4  || this.currentCalculator.calculatorNo === 5 || this.currentCalculator.calculatorNo === 7 || this.currentCalculator.calculatorNo === 9 ? html`
                        <div class="form-group">
                            <label>No. of collections per fortnight</label>
                            <select @change=${(e) => this.handleInputChange(e, '')}> 
                                <option value="1">1</option>
                                <option value="2">2</option>
                            </select>
                        </div>
                        ` : ''}
        
                        ${this.renderResults()}
                    </div>
                `;
            }
        
            renderResults() {
                if (!this.currentCalculator?.results) return html``;
        
                const r = this.currentCalculator.results;
                return html`
                    <div class="results">
                        <h3>Results:</h3>
                        
                        <h4>Waste Bins:</h4>
                        <p>Generation: ${r.waste.generation} L/week</p>
                        <p>Bin Size: ${r.waste.binSize}L</p>
                        <p>Number of Bins: ${r.waste.numberOfBins}</p>
                        <p>Space Required: ${r.waste.spaceRequired}m²</p>
        
                        <h4>Recycling Bins:</h4>
                        <p>Generation: ${r.recycling.generation} L/week</p>
                        <p>Bin Size: ${r.recycling.binSize}L</p>
                        <p>Number of Bins: ${r.recycling.numberOfBins}</p>
                        <p>Space Required: ${r.recycling.spaceRequired}m²</p>
        
                        ${r.organic.generation > 0 ? html`
                            <h4>Organic Bins:</h4>
                            <p>Generation: ${r.organic.generation} L/week</p>
                            <p>Bin Size: ${r.organic.binSize}L</p>
                            <p>Number of Bins: ${r.organic.numberOfBins}</p>
                            <p>Space Required: ${r.organic.spaceRequired}m²</p>
                        ` : ''}
        
                        <h4>Totals:</h4>
                        <p>Total Bins: ${r.total.numberOfBins}</p>
                        <p>Total Space Required: ${r.total.spaceRequired}m²</p>
                        ${r.total.bulkyWasteSpace > 0 ? html`
                            <p>Bulky Waste Space: ${r.total.bulkyWasteSpace}m²</p>
                        ` : ''}
                    </div>
                `;
            }
        
            render() {
                return html`
                    <nav>
                        <slot name="tab" @click=${(e) => this.handleSelect(e)}></slot>
                    </nav>
                    ${this.renderCalculatorForm()}
                `;
            }
        }

        customElements.define('bin-calculator', BinCalculator);