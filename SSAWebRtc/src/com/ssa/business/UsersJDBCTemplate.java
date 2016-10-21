package com.ssa.business;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

import javax.sql.DataSource;

import com.ssa.transferObject.User;

public class UsersJDBCTemplate implements UserOperationDAO{

	private DataSource dataSource;

	public void setDataSource(DataSource dataSource) {
		this.dataSource = dataSource;
	}
	
	@Override
	public boolean insert(User user) {
		
		 boolean successfulInsert = false;
		 int maxId = selectMaxID() + 1;
		 String sql = null;
		 sql = "insert into USERS(ID,EMAIL_ID,STATUS,CONNECTED_TO,AGENT_TYPE,USER_TYPE) values ("+ maxId + ",?,?,?,?,?)";
		 
		 Connection conn = null;
		try{
			conn = dataSource.getConnection();
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, user.getEmailId());
			ps.setString(2, "Available");
			ps.setString(3, "");
			ps.setString(4, user.getAgentType());
			ps.setString(5, user.getUserType());
//			if(user.getUserType().equalsIgnoreCase("Agent")){
//				ps.setString(4, user.getAgentType());
//				ps.setString(5, "Agent");
//			}
//			else if(user.getUserType().equalsIgnoreCase("Client")){
//				ps.setString(4, "");
//				ps.setString(5, "Client");
//			}
			
			ps.executeUpdate();
			ps.close();
			successfulInsert = true;
		}
		catch(Exception e){
			e.printStackTrace();
			successfulInsert = false;
		}
		finally{
			try {
				conn.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
		return successfulInsert;
	}
	
	
	private int selectMaxID() {
		
		 String sql = "select max(ID) as ID from USERS";
		 Connection conn = null;
		 int id=0;
		try{
			conn = dataSource.getConnection();
			PreparedStatement ps = conn.prepareStatement(sql);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				   id = rs.getInt("ID");
				}

		}
		catch(Exception e){
			e.printStackTrace();
		}
		finally{
			try {
				conn.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
			
		}
		return id;
		
	}
	
	
	@Override
	public List<User> selectAllUsers(String agent){

		String sql = "SELECT * FROM USERS where USER_TYPE='Agent' and AGENT_TYPE=?";

		Connection conn = null;
        List<User> userList = new ArrayList<>();  
		try {
			conn = dataSource.getConnection();
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, agent);
			
			User customer = null;
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				    String emailId = rs.getString("EMAIL_ID");
					String status = rs.getString("STATUS");
					String connectedTo = rs.getString("CONNECTED_TO");
					String agentType = rs.getString("AGENT_TYPE");
					String userType = rs.getString("USER_TYPE");
					Timestamp startTime = rs.getTimestamp("START_TIME");
					Timestamp endTime = rs.getTimestamp("END_TIME");
					
					//SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
					//String startTimeString  = dateFormat.format(startTime.getTime());
					//System.out.println("--startTimeString--"+startTimeString);
					StringBuilder sb=new StringBuilder("");
					if(status!=null && !status.equalsIgnoreCase("Busy"))
						{
							if(startTime !=null && endTime != null){
							System.out.println("--startTime--"+startTime.getTime());
							
							long diff = startTime.getTime() - endTime.getTime();
							
							long diffSeconds = diff / 1000 % 60;
							long diffMinutes = diff / (60 * 1000) % 60;
							long diffHours = diff / (60 * 60 * 1000) % 24;
							
							System.out.print(diffHours + " hours, ");
							System.out.print(diffMinutes + " minutes, ");
							System.out.print(diffSeconds + " seconds.");
							
							sb.append(diffHours);
							sb.append("- Hours. ");
							sb.append(diffMinutes);
							sb.append("- minutes. ");
							sb.append(diffSeconds);
							sb.append("- seconds. ");
							}
					}
					
					
					//System.out.println("--endTime--"+endTime);
				customer = new User(emailId, status, connectedTo, agentType,userType, sb.toString());
				userList.add(customer);	
			}
			rs.close();
			ps.close();
			return userList;
		} catch (SQLException e) {
			throw new RuntimeException(e);
		} finally {
			if (conn != null) {
				try {
				conn.close();
				} catch (SQLException e) {}
			}
		}
	}

	@Override
	public User findByCustomerId(int custId) {
		// TODO Auto-generated method stub
		return null;
	}
	
	@Override
	public String getAvailableAgent(String agentTypeInput){
		
		//String sql = "SELECT EMAIL_ID FROM USERS where USER_TYPE='Agent' and STATUS = 'Available' and (AGENT_TYPE = upper(?) or AGENT_TYPE = lower(?))";
		String sql = "SELECT EMAIL_ID FROM USERS where USER_TYPE='Agent' and STATUS = 'Available' and AGENT_TYPE = ?";
        String availableAgent = null;
		Connection conn = null;
        List<String> userList = new ArrayList<String>();  
		try {
			conn = dataSource.getConnection();
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, agentTypeInput);
			//ps.setString(2, agentTypeInput);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
					String emailId = rs.getString("EMAIL_ID");
				userList.add(emailId);	
			}
			rs.close();
			ps.close();
			
			if(userList.get(0)!=null){
				availableAgent = userList.get(0);
			}
		} catch (SQLException e) {
			throw new RuntimeException(e);
		} finally {
			if (conn != null) {
				try {
				conn.close();
				} catch (SQLException e) {}
			}
		}
		
		return availableAgent;
		
	}
	
	@Override
	public boolean connectToAgent(String client , String agent){
		
		boolean successfulConnection = false;
		String clientUpdatesql = "UPDATE USERS SET CONNECTED_TO = ?  WHERE EMAIL_ID = ?";
		String agentUpdatesql = "UPDATE USERS SET CONNECTED_TO = ? , START_TIME = CURRENT_TIMESTAMP WHERE EMAIL_ID = ?";
		//String statusUpdatesql = "UPDATE USERS SET STATUS='Busy' WHERE EMAIL_ID is NOT NULL and CONNECTED_TO != ''";
		String statusUpdatesql = "UPDATE USERS SET STATUS='Busy' WHERE EMAIL_ID = ? or EMAIL_ID = ?";
        Connection conn = null;
         
		try {
			conn = dataSource.getConnection();
			PreparedStatement clientPreparedStatement = conn.prepareStatement(clientUpdatesql);
			clientPreparedStatement.setString(1, agent);
			clientPreparedStatement.setString(2, client);
			clientPreparedStatement.executeUpdate();
			
			
			PreparedStatement agentPreparedStatement = conn.prepareStatement(agentUpdatesql);
			agentPreparedStatement.setString(1, client);
			agentPreparedStatement.setString(2, agent);
			agentPreparedStatement.executeUpdate();
			
			
			PreparedStatement statusPreparedStatement = conn.prepareStatement(statusUpdatesql);
			statusPreparedStatement.setString(1, agent);
			statusPreparedStatement.setString(2, client);
			statusPreparedStatement.executeUpdate();
			
			clientPreparedStatement.close();
			agentPreparedStatement.close();
			statusPreparedStatement.close();
			
			successfulConnection = true;
			
		} catch (SQLException e) {
			successfulConnection = false;
			throw new RuntimeException(e);
		} finally {
			if (conn != null) {
				try {
				conn.close();
				} catch (SQLException e) {}
			}
		}
		return successfulConnection;
	}
	
	
	@Override
	public boolean disconnectAgent(String client , String agent){
		
		boolean successfulConnection = false;
		String clientUpdatesql = "UPDATE USERS SET CONNECTED_TO = ''  WHERE EMAIL_ID = ?";
		String agentUpdatesql = "UPDATE USERS SET CONNECTED_TO = '' , END_TIME = CURRENT_TIMESTAMP WHERE EMAIL_ID = ?";
		//String statusUpdatesql = "UPDATE USERS SET STATUS='Busy' WHERE EMAIL_ID is NOT NULL and CONNECTED_TO != ''";
		String statusUpdatesql = "UPDATE USERS SET STATUS='Available' WHERE EMAIL_ID = ? or EMAIL_ID = ?";
        Connection conn = null;
         
		try {
			conn = dataSource.getConnection();
			PreparedStatement clientPreparedStatement = conn.prepareStatement(clientUpdatesql);
			clientPreparedStatement.setString(1, client);
			clientPreparedStatement.executeUpdate();
			
			
			PreparedStatement agentPreparedStatement = conn.prepareStatement(agentUpdatesql);
			agentPreparedStatement.setString(1, agent);
			agentPreparedStatement.executeUpdate();
			
			
			PreparedStatement statusPreparedStatement = conn.prepareStatement(statusUpdatesql);
			statusPreparedStatement.setString(1, agent);
			statusPreparedStatement.setString(2, client);
			statusPreparedStatement.executeUpdate();
			
			clientPreparedStatement.close();
			agentPreparedStatement.close();
			statusPreparedStatement.close();
			
			successfulConnection = true;
			
		} catch (SQLException e) {
			successfulConnection = false;
			throw new RuntimeException(e);
		} finally {
			if (conn != null) {
				try {
				conn.close();
				} catch (SQLException e) {}
			}
		}
		return successfulConnection;
	}

	   
	   
}

