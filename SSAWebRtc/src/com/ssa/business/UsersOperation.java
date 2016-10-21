package com.ssa.business;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.stereotype.Component;

import com.ssa.transferObject.User;

@Component
public class UsersOperation {

	private static String dbURL = "jdbc:derby://13.125.82.52:1527/ssaWebRtc";
	private static Connection conn = null;
	private static Statement stmt = null;
	
	public static void main(String[] args) {

		ApplicationContext context =
	    		new ClassPathXmlApplicationContext("file:src/resources/spring-servlet.xml");
			System.out.println("Insertion starts");
		UserOperationDAO userOperationDAO = (UserOperationDAO) context.getBean("userOperationDAO");
	        User customer = new User("agent1@ssa.gov","Available","","W2","Agent","");
	        User customer1 = new User("agent2@ssa.gov","Available","","Retirement","Agent","");
	        //User customer2 = new User("agent3@ssa.gov","","","Disability","Agent");
	        //User customer3 = new User("agent4@ssa.gov","","","W2","Agent");
	        User customer4 = new User("Customer1@ssa.gov","Available","","","Customer","");
	        User customer5 = new User("Customer2@ssa.gov","Available","","","Customer","");
	        //userOperationDAO.insert(customer);
	        //userOperationDAO.insert(customer1);
	        //userOperationDAO.insert(customer4);
	        //userOperationDAO.insert(customer5);
	        //userOperationDAO.insert(customer4);
	        //userOperationDAO.insert(customer5);
	        System.out.println("Insertion completed");
	        //String availableAgent = userOperationDAO.getAvailableAgent("W2");
	        //userOperationDAO.connectToAgent("Customer1@ssa.gov" , "agent2@ssa.gov");
	        //System.out.println("--availableAgent--"+availableAgent);
	        List<User> userList = userOperationDAO.selectAllUsers("W2");
	        for(User user : userList){
	        	System.out.println("Email Id--"+user.getEmailId());
	        	System.out.println("Status--"+user.getStatus());
	        	System.out.println("Connected To--"+user.getConnectedTo());
	        	System.out.println("Agent Type--"+user.getAgentType());
	        	System.out.println("User Type--"+user.getUserType());
	        	System.out.println("--Duration--"+user.getDuration());
	        }
	        //Customer customer1 = userOperationDAO.findByCustomerId(1);
	        //System.out.println(customer1);

		
		
		
	}
	
	private static void createConnection() {
		try{
			Class.forName("org.apache.derby.jdbc.ClientDriver").newInstance();
			conn = DriverManager.getConnection(dbURL);
		}
		catch(Exception e){
			e.printStackTrace();
		}
	}
	
	private static void insertUsers(){
		try{
			stmt = conn.createStatement();
			stmt.execute("insert into USERS values (2,'agent@ssa.gov','available','customer1','w2','Agent')");
		}
		catch(Exception e){
			e.printStackTrace();
		}
		finally{
			try {
				stmt.close();
				conn.close();
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			
		}
	}
	

	private static void shutdown(){
		try
		{
			if(stmt!=null){
				stmt.close();
			}
			if(conn!=null){
				DriverManager.getConnection(dbURL + ";shutdown=true");
				conn.close();
			}
		}
		catch(Exception e){
			e.printStackTrace();
		}
	}
	
	

}
