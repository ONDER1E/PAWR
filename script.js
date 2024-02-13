$(document).ready(function () {
    // Function to update content
    function updateContent( on_del = false) {
        $.ajax({
            url: 'Departure.yaml',
            cache: false,
            success: function (data) {
                $('#departuresContent').text(data);
                createButtons('departuresContent');
            }
        });

        $.ajax({
            url: 'Arrival.yaml',
            cache: false,
            success: function (data) {
                $('#arrivalsContent').text(data);
                createButtons('arrivalsContent');
            }
        });

        if (on_del == false) {
            // Recursive call for continuous updates
            setTimeout(updateContent, 5000); // Update every 500 milliseconds
        }
    }

    // Function to create delete buttons
function createButtons(containerId) {
    const container = $(`#${containerId}`);
    const lines = container.text().split('\n');

    container.empty(); // Clear existing content before updating

    lines.forEach(line => {
        if (line.includes('Callsign: ')) {
            const callsign = line.split('Callsign: ')[1]; // Removed trim

            const button = $('<button>Delete</button>');
            
            button.on('click', function () {
                // Send an AJAX request to the Flask app with the callsign
                $.ajax({
                    type: 'POST',
                    url: '/',
                    data: { callsign: callsign },
                    success: function(response) {
                        // Handle success if needed
                        console.log(response);
                    },
                    error: function(error) {
                        // Handle error if needed
                        console.error(error);
                    }
                });
            });

            container.append(line + ' ').append(button).append('<br>');
        } else {
            container.append(line + '<br>');
        }
    });
}


    // Initial update
    updateContent();
});
