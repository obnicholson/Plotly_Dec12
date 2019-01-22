metaURL = "/metadata/"
sampleURL = "/samples/"

function buildMetadata(sample) {
  // get metadata for sample
  var sampleNumber = d3.select('#selDataset').select('option:checked').property('value')
  var metadataURL = `${metaURL}${sampleNumber}`;

  d3.json(metadataURL).then(function(data) {
    var sampleMetadataRow = d3.select('#sample-metadata')

    sampleMetadataRow.html('')

    Object.entries(data).forEach(function([key, value]) {
      // if (key != 'sample'){
        sampleMetadataRow.append('div')
          .classed('card-block well', true)
          .append('h5')
          .attr('align', 'center')
          .html(`${key}</h5><h4>${value}</h4>`)
      // }
    });
    
    // gauge (each wash will be 20 degrees - 9*20=180)
    var washFreq = data.WFREQ;
    var freqDeg = washFreq*20

    var degrees = 180 - freqDeg, radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = String(radius * Math.cos(radians));
    var y = String(radius * Math.sin(radians));

    var path = `M -.0 -0.025 L .0 0.025 L ${x} ${y} Z`
    
    var gaugeData = [{type: 'scatter',
                        x: [0],
                        y: [0],
                        marker: {size: 28, color: '850000'},
                        showlegend: false,
                        name: 'wash frequency',
                        text: washFreq,
                        hoverinfo: 'text+name'},
                      {values: [20,20,20,20,20,20,20,20,20,180],
                        rotation: 90,
                        text: ['8-9','7-8','6-7','5-6','4-5','3-4','2-3','1-2','0-1'],
                        textinfo: 'text',
                        textposition: 'inside',
                        marker: {colors:['#003f5c','#005b77','#00798a','#009791','#03b48d','#68cf82','#afe775','#d4f170','#fafa6e','#ffffff']},
                        labels:['8-9','7-8','6-7','5-6','4-5','3-4','2-3','1-2','0-1'],
                        hoverinfo: 'label',
                        hole: .5,
                        type: 'pie',
                        showlegend: true
                    }];
    var gaugeLayout = {
      shapes:[{
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: {
          color: '850000'
        }
      }],
      title: 'Wash Frequency: Scrubs Per Week',
      xaxis: {zeroline: false, showticklabels: false, showgrid: false, range: [-1,1]},
      yaxis: {zeroline: false, showticklabels: false, showgrid: false, range: [-1,1]}
    };
    
    Plotly.newPlot('gauge',gaugeData,gaugeLayout);

  });
}

function buildCharts(sample) {

  // get sample data
  var sampleNumber = d3.select('#selDataset').select('option:checked').property('value')
  var sampleDataURL = `${sampleURL}${sampleNumber}`;

  d3.json(sampleDataURL).then(function(data) {
    console.log(data.otu_ids);

    // bubble chart
    var bubbleTrace = {
      x: data.otu_ids,
      y: data.sample_values,
      text: data.otu_labels,
      mode: 'markers',
      marker: {size: data.sample_values,
        color: data.otu_ids}
      };

    var bubbleData = [bubbleTrace];

    var bubbleLayout = {
      margin: {
        l: 100,
        r: 0,
        b: 100,
        t: 0
      }
    };

    Plotly.newPlot("bubble",bubbleData, bubbleLayout);


    // pie chart
    var pieSliceIDs = data.otu_ids.slice(0,10);
    var pieSliceLabels = data.otu_labels.slice(0,10);
    var pieSliceValues = data.sample_values.slice(0,10);

    var pieTrace ={
      values: pieSliceValues,
      labels: pieSliceIDs,
      hoverinfo: pieSliceLabels,
      type: "pie",
    };

    var pieLayout = {
      title: 'Top 10 Samples'
    };

    var pieData = [pieTrace];

    Plotly.newPlot("pie",pieData, pieLayout); 

  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
