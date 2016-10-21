package com.ssa.controller;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;

import com.ssa.business.UserOperationDAO;
import com.ssa.transferObject.User;


@Controller
@RequestMapping("/webRtc")
public class WebRtcController extends AbstractController {
	
	final static Logger logger = Logger.getLogger(WebRtcController.class);
	
	@Autowired
	UserOperationDAO userService;
	
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest arg0, HttpServletResponse arg1) throws Exception {
		ModelAndView model = new ModelAndView("HelloWorldPage");
		model.addObject("msg", "hello world");

		return model;
	}
	
    @RequestMapping(method = RequestMethod.GET)
    public String sayHello(ModelMap model) {
        model.addAttribute("greeting", "Hello World from Spring 4 MVC");
        return "welcome";
    }
    
    @RequestMapping(value="/helloagain", method = RequestMethod.GET)
    public String sayHelloAgain(ModelMap model) {
        model.addAttribute("greeting", "Hello World Again, from Spring 4 MVC");
        return "welcome";
    }
    
    
    @RequestMapping(value = "/getagentslist/agenttype/{agenttype}", method = RequestMethod.GET)
    public @ResponseBody  ResponseEntity<List<User>> listAllUsers(@PathVariable String agenttype) {
    	logger.debug("Entering listAllUsers");
        List<User> users = userService.selectAllUsers(agenttype);
        if(users.isEmpty()){
            return new ResponseEntity<List<User>>(HttpStatus.NO_CONTENT);//You many decide to return HttpStatus.NOT_FOUND
        }
        return new ResponseEntity<List<User>>(users, HttpStatus.OK);
    }
    
    @RequestMapping(value = "/insertUser", method = RequestMethod.POST,headers = {"Content-type=application/json"}
    ,consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public  boolean insertUser(@RequestBody User user) {
    	logger.debug("Entering insertUser");
    	logger.debug("User---"+user);
        boolean returnVal = userService.insert(user);
        return returnVal;
    }
    
    @RequestMapping(value = "/getavailableagent/{questionType}", method = RequestMethod.GET)
    @ResponseBody
    public String getAvailableAgent(@PathVariable String questionType) {
    	logger.debug("Entering getAvailableAgent");
    	logger.debug("--questionType---"+questionType);
        String returnVal = userService.getAvailableAgent(questionType);
        return returnVal;
    }
    
    @RequestMapping(value = "/connectagent/customerid/{customerid}/agentid/{agentid}", method = RequestMethod.GET)
    @ResponseBody
    public boolean connectAgent(@PathVariable String customerid, @PathVariable String agentid) {
    	logger.debug("Entering connectAgent");
    	logger.debug("--customerid---"+customerid);
    	logger.debug("--agentid---"+agentid);
    	boolean returnVal = userService.connectToAgent(customerid, agentid);
        return returnVal;
    }
    
    @RequestMapping(value = "/disconnectagent/customerid/{customerid}/agentid/{agentid}", method = RequestMethod.GET)
    @ResponseBody
    public boolean disconnectAgent(@PathVariable String customerid, @PathVariable String agentid) {
    	logger.debug("Entering connectAgent");
    	logger.debug("--customerid---"+customerid);
    	logger.debug("--agentid---"+agentid);
    	boolean returnVal = userService.disconnectAgent(customerid, agentid);
        return returnVal;
    }


}
