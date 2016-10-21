/**
 * 
 */

$(document).ready(function(){

   // jQuery methods go here...
	
	$('.btn-primary').click(function (event) {
	    //Process button click event
	    alert(this.id);
	    $("#agents tbody tr").remove();
	    
	      $.ajax({
		        url: 'https://13.63.249.131:7002/SSACallCenter/mvc/webRtc/getagentslist/agenttype/' + this.id,
		        type: 'GET',
		        success: function (data) {
		    		var rowCount = $('#agents tr').length;
		    		
		    		if(rowCount==1)
		    			{
		    				$(function() {
		    					$.each(data,function(i,item){
		    					    $("#agents tbody").append(
		    					        "<tr>"
		    					            +"<td>"+item.emailId+"</td>"
		    					            +"<td>"+item.status+"</td>"
		    					            +"<td>"+item.connectedTo+"</td>"
		    					            +"<td>"+item.duration+"</td>"
		    					        +"</tr>" )
		    					    })
		    				});
		    			}
		    		
		        },
		        async:false,
		        error: function () {
		            //alert("error");
		        }
		        
		    });
	    
	    });

//	$('#w2').on('click', function (e) {
//		
//		$("#agents tbody tr").remove();
//		
//		var response = [{
//		      emailId:"agent1@ssa.gov",
//		      status:"Busy",
//		      ConnectedTo:"Customer1@ssa.gov"
//		     },
//		     {
//		       emailId:"agent2@ssa.gov",
//		       status:"Available",
//		       ConnectedTo:""
//		    }];
//
		// convert string to JSON
		//var response = JSON.parse(input);
//		var rowCount = $('#agents tr').length;
//		
//		if(rowCount==1)
//			{
//				$(function() {
//					$.each(response,function(i,item){
//					    $("#agents tbody").append(
//					        "<tr>"
//					            +"<td>"+item.emailId+"</td>"
//					            +"<td>"+item.status+"</td>"
//					            +"<td>"+item.ConnectedTo+"</td>"
//					        +"</tr>" )
//					    })
//				});
//			}
//	
//	})
	
//		$('#disability').on('click', function (e) {
//	
//        $("#agents tbody tr").remove();
//        
//		var response = [{
//		      emailId:"agent3@ssa.gov",
//		      status:"Busy",
//		      ConnectedTo:"Customer1@ssa.gov"
//		     },
//		     {
//		       emailId:"agent4@ssa.gov",
//		       status:"Available",
//		       ConnectedTo:""
//		    }];
//
//		// convert string to JSON
//		//var response = JSON.parse(input);
//		var rowCount = $('#agents tr').length;
//		
//		if(rowCount==1)
//			{
//				$(function() {
//					$.each(response,function(i,item){
//					    $("#agents tbody").append(
//					        "<tr>"
//					            +"<td>"+item.emailId+"</td>"
//					            +"<td>"+item.status+"</td>"
//					            +"<td>"+item.ConnectedTo+"</td>"
//					        +"</tr>" )
//					    })
//				});
//			}
//	
//	})

});