metaURL = "/metadata/"
sampleURL = "/samples/"

var colorList = ['#fafa6e','#e3e56e','#cccf6c','#b5ba6b','#9ea669','#889266','#727f63','#5b6c60','#445a5c','#2a4858']
console.log(colorList)

function buildMetadata(sample) {
  // get metadata for sample
  var sampleNumber = d3.select('#selDataset').select('option:checked').property('value')
  var metadataURL = `${metaURL}${sampleNumber}`;

  d3.json(metadataURL).then(function(data) {
    var sampleMetadataPanel = d3.select('#sample-metadata')

    sampleMetadataPanel.html('')

    Object.entries(data).forEach(function([key, value]) {
      sampleMetadataPanel.append('h7').text(`${key}: ${value}`).append('br');
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
                        marker: {colors:['#fafa6e','#e3e56e','#cccf6c','#b5ba6b','#9ea669','#889266','#727f63','#5b6c60','#445a5c', '#ffffff00']},
                        labels:['8-9','7-8','6-7','5-6','4-5','3-4','2-3','1-2','0-1'],
                        hoverinfo: 'label',
                        hole: .5,
                        type: 'pie',
                        showlegend: true
                    }];
    var layout = {
      shapes:[{
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: {
          color: '850000'
        }
      }],
      title: 'Wash Frequency',
      xaxis: {zeroline: false, showticklabels: false, showgrid: false, range: [-1,1]},
      yaxis: {zeroline: false, showticklabels: false, showgrid: false, range: [-1,1]}
    };
    
    Plotly.newPlot('gauge',gaugeData,layout);

  });
}

function buildCharts(sample) {

  // get sample data
  var sampleNumber = d3.select('#selDataset').select('option:checked').property('value')
  var sampleDataURL = `${sampleURL}${sampleNumber}`;

  d3.json(sampleDataURL).then(function(data) {

    // bubble chart
    var bubbleTrace = {
      x: data.otu_ids,
      y: data.sample_values,
      text: data.otu_labels,
      mode: 'markers',
      marker: {size: data.sample_values,
              color: data.otu_ids,
            }
    };

    var bubbleData = [bubbleTrace];

    Plotly.newPlot("bubble",bubbleData);


    // pie chart
    var pieSliceIDs = data.otu_ids.slice(0,10);
    var pieSliceLabels = data.otu_labels.slice(0,10);
    var pieSliceValues = data.sample_values.slice(0,10);

    var pieTrace ={
      values: pieSliceValues,
      labels: pieSliceIDs,
      hoverinfo: pieSliceLabels,
      type: "pie",
      marker: {colors: colorList}
    };

    var pieData = [pieTrace];

    Plotly.newPlot("pie",pieData); 

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
