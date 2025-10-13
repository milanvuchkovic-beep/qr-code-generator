body { font-family: Arial, sans-serif; background-color: #f0f0f0; margin: 0; padding: 20px; }
.container { max-width: 800px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
h1, p { text-align: center; }
.form-section { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
.form-group { display: flex; flex-direction: column; }
label { margin-bottom: 5px; font-size: 14px; color: #333; }
input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; }
.button-group { display: flex; gap: 10px; }
button { flex-grow: 1; padding: 12px; background: #007bff; color: #fff; border: none; border-radius: 4px; font-size: 18px; cursor: pointer; }
button:hover { background: #0056b3; }
#export-csv-btn { background-color: #28a745; }
#export-csv-btn:hover { background-color: #218838; }

#labels-container { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 20px; }
.label-item { width: 350px; border: 1px solid #000; padding: 10px; display: flex; gap: 10px; align-items: center; background: #fff; page-break-inside: avoid; }
.qr-code-area { flex-shrink: 0; }
.data-fields-qr { font-size: 12px; font-family: 'Courier New', Courier, monospace; }
.data-fields-qr div { margin-bottom: 4px; }

.label-item.small-layout { flex-direction: column; justify-content: center; align-items: center; gap: 5px; width: 200px; }
.small-layout-text { font-size: 8px; font-family: 'Courier New', Courier, monospace; word-break: break-all; text-align: center; }

@media print {
    @page {
        size: 30mm 15mm landscape;
        margin: 0; 
    }
    .no-print { display: none; }
    body { background-color: #fff; padding: 0; margin: 0; }
    #labels-container { margin: 0; padding: 0; }
    .label-item {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        padding: 2mm;
        border: none;
        box-shadow: none;
        page-break-after: always;
        page-break-inside: avoid;
        display: flex; 
        align-items: center;
        justify-content: center;
    }
    .label-item:not(.small-layout) {
        flex-direction: row; 
        justify-content: flex-start;
        gap: 5mm;
    }
    .label-item:not(.small-layout) .data-fields-qr {
        font-size: 9pt; 
    }
    .label-item.small-layout {
        flex-direction: column;
        gap: 1mm;
    }
     .label-item.small-layout .small-layout-text {
        font-size: 6pt; /* Smanjen font za veoma male nalepnice */
    }
}
