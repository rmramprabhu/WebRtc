package com.ssa.transferObject;

import java.io.Serializable;

public class User implements Serializable {

	  public User() {
		
	}
	public User(String emailId, String status, String connectedTo, String agentType, String userType, String duration) {
		this.emailId = emailId;
		this.status = status;
		this.connectedTo = connectedTo;
		this.agentType = agentType;
		this.userType = userType;
		this.setDuration(duration);
	}
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private String emailId;
	private String status;
    private String connectedTo;
    private String userType;
    private String agentType;
    private String duration;
	  
	  
	public String getEmailId() {
		return emailId;
	}
	public void setEmailId(String emailId) {
		this.emailId = emailId;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getConnectedTo() {
		return connectedTo;
	}
	public void setConnectedTo(String connectedTo) {
		this.connectedTo = connectedTo;
	}
	public String getAgentType() {
		return agentType;
	}
	public void setAgentType(String agentType) {
		this.agentType = agentType;
	}
	public String getUserType() {
		return userType;
	}
	public void setUserType(String userType) {
		this.userType = userType;
	}
	public String getDuration() {
		return duration;
	}
	public void setDuration(String duration) {
		this.duration = duration;
	}
	

}

