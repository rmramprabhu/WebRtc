package com.ssa.business;

import java.util.List;

import com.ssa.transferObject.User;

public interface UserOperationDAO {
	public boolean insert(User user);
	public User findByCustomerId(int custId);
	public List<User> selectAllUsers(String agenttype);
	public String getAvailableAgent(String agentTypeInput);
	public boolean connectToAgent(String caller, String callee);
	public boolean disconnectAgent(String caller, String callee);
}
