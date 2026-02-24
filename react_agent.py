#!/usr/bin/env python3
"""
ReAct Agent 实现 - 用于学习 Agent 与大模型的交互方式

ReAct (Reasoning + Acting) 是一种将推理和行动结合的范式：
- Thought: 思考当前情况，规划下一步
- Action: 执行具体动作（如调用工具）
- Observation: 观察动作返回的结果

这个实现展示了 Agent 如何与大模型交互，以及如何通过工具扩展能力。
"""

import json
import re
from typing import Callable, Dict, List, Optional, Any
from dataclasses import dataclass, field
from enum import Enum


class ActionType(Enum):
    """动作类型枚举"""
    THINK = "think"      # 思考
    SEARCH = "search"    # 搜索
    CALCULATE = "calculate"  # 计算
    ANSWER = "answer"    # 给出最终答案


@dataclass
class Tool:
    """工具定义类"""
    name: str
    description: str
    func: Callable[[str], str]

    def execute(self, input_str: str) -> str:
        """执行工具"""
        try:
            return self.func(input_str)
        except Exception as e:
            return f"错误: {str(e)}"


@dataclass
class Message:
    """对话消息"""
    role: str  # system, user, assistant
    content: str


@dataclass
class AgentStep:
    """Agent 执行的每一步记录"""
    step_number: int
    thought: str
    action: str
    action_input: str
    observation: str


class MockLLM:
    """
    模拟大模型接口
    实际项目中这里应该调用 OpenAI、Claude 等真实的大模型 API
    """

    def __init__(self):
        self.call_count = 0

    def chat(self, messages: List[Message], tools_description: str) -> str:
        """
        模拟与大模型的对话

        Args:
            messages: 对话历史
            tools_description: 可用工具的描述

        Returns:
            大模型的回复文本
        """
        self.call_count += 1

        # 获取最后一条用户消息
        last_user_msg = None
        for msg in reversed(messages):
            if msg.role == "user":
                last_user_msg = msg.content
                break

        # 模拟 ReAct 格式的响应
        # 实际的大模型会根据提示词生成 Thought 和 Action
        return self._generate_react_response(last_user_msg, messages)

    def _generate_react_response(self, query: str, messages: List[Message]) -> str:
        """
        根据查询生成模拟的 ReAct 响应
        这里用简单的规则模拟大模型的推理过程
        """
        # 分析历史步骤，决定下一步
        history_text = "\n".join([m.content for m in messages if m.role == "assistant"])
        step_count = history_text.count("Thought:")

        # 模拟不同阶段的推理
        if "计算" in query or "+" in query or "*" in query or "/" in query:
            return self._handle_calculation(query, step_count)
        elif "搜索" in query or "查" in query:
            return self._handle_search(query, step_count)
        else:
            return self._handle_general(query, step_count)

    def _handle_calculation(self, query: str, step_count: int) -> str:
        """处理计算类查询"""
        if step_count == 0:
            return """Thought: 用户需要进行数学计算，我需要使用 calculate 工具来完成这个计算任务。
Action: calculate
Action Input: 计算表达式"""
        else:
            return """Thought: 我已经得到了计算结果，现在可以给出最终答案了。
Action: answer
Action Input: 根据计算结果，答案是..."""

    def _handle_search(self, query: str, step_count: int) -> str:
        """处理搜索类查询"""
        if step_count == 0:
            return """Thought: 用户需要搜索信息，我应该使用 search 工具来查找相关内容。
Action: search
Action Input: 搜索关键词"""
        else:
            return """Thought: 我已经搜索到了相关信息，现在可以总结并给出答案了。
Action: answer
Action Input: 根据搜索结果，我了解到..."""

    def _handle_general(self, query: str, step_count: int) -> str:
        """处理一般查询"""
        if step_count == 0:
            return """Thought: 这是一个一般性问题，我需要先思考一下如何回答。
Action: think
Action Input: 分析这个问题..."""
        else:
            return """Thought: 经过思考，我现在可以给出答案了。
Action: answer
Action Input: 根据我的分析，答案是..."""


class ReActAgent:
    """
    ReAct 模式的 Agent 实现

    ReAct 循环:
    1. 接收用户输入
    2. 大模型生成 Thought（思考）和 Action（动作）
    3. 执行 Action，获得 Observation（观察结果）
    4. 将 Observation 反馈给大模型
    5. 重复 2-4 直到得到最终答案
    """

    def __init__(self, llm: MockLLM, max_steps: int = 10):
        """
        初始化 Agent

        Args:
            llm: 大模型接口
            max_steps: 最大执行步数，防止无限循环
        """
        self.llm = llm
        self.max_steps = max_steps
        self.tools: Dict[str, Tool] = {}
        self.history: List[AgentStep] = []
        self.messages: List[Message] = []

        # 注册内置工具
        self._register_default_tools()

    def _register_default_tools(self):
        """注册默认工具"""
        # 思考工具
        self.register_tool(Tool(
            name="think",
            description="用于深入思考问题，分析问题的各个方面",
            func=self._tool_think
        ))

        # 搜索工具（模拟）
        self.register_tool(Tool(
            name="search",
            description="用于搜索信息，输入搜索关键词",
            func=self._tool_search
        ))

        # 计算工具
        self.register_tool(Tool(
            name="calculate",
            description="用于执行数学计算，输入数学表达式",
            func=self._tool_calculate
        ))

    def register_tool(self, tool: Tool):
        """注册新工具"""
        self.tools[tool.name] = tool

    def _tool_think(self, input_str: str) -> str:
        """思考工具 - 只是返回输入，用于让模型整理思路"""
        return f"思考完成: {input_str}"

    def _tool_search(self, query: str) -> str:
        """搜索工具 - 模拟搜索结果"""
        # 实际项目中这里应该调用真实的搜索引擎 API
        mock_results = {
            "天气": "今天北京天气晴朗，气温 20-28°C",
            "Python": "Python 是一种高级编程语言，由 Guido van Rossum 创建",
            "ReAct": "ReAct 是一种结合推理和行动的 AI 范式，由 Google Research 提出",
        }

        for key, value in mock_results.items():
            if key in query:
                return f"搜索结果: {value}"

        return f"搜索结果: 找到关于 '{query}' 的相关信息（模拟数据）"

    def _tool_calculate(self, expression: str) -> str:
        """计算工具 - 安全执行数学计算"""
        try:
            # 只允许基本数学运算符和数字
            allowed_chars = set('0123456789+-*/(). ')
            if not all(c in allowed_chars for c in expression):
                return "错误: 表达式包含非法字符"

            # 安全计算
            result = eval(expression)
            return f"计算结果: {result}"
        except Exception as e:
            return f"计算错误: {str(e)}"

    def _get_tools_description(self) -> str:
        """生成工具描述文本"""
        descriptions = []
        for name, tool in self.tools.items():
            descriptions.append(f"- {name}: {tool.description}")
        return "\n".join(descriptions)

    def _parse_llm_response(self, response: str) -> tuple:
        """
        解析大模型的 ReAct 格式响应

        ReAct 格式:
        Thought: [思考内容]
        Action: [动作名称]
        Action Input: [动作输入]

        Returns:
            (thought, action, action_input)
        """
        thought_match = re.search(r'Thought:\s*(.+?)(?=\nAction:|$)', response, re.DOTALL)
        action_match = re.search(r'Action:\s*(\w+)', response)
        input_match = re.search(r'Action Input:\s*(.+?)(?=\n|$)', response, re.DOTALL)

        thought = thought_match.group(1).strip() if thought_match else ""
        action = action_match.group(1).strip() if action_match else ""
        action_input = input_match.group(1).strip() if input_match else ""

        return thought, action, action_input

    def _build_system_prompt(self) -> str:
        """构建系统提示词"""
        return f"""你是一个 ReAct 模式的 AI Agent。你需要通过思考和行动来解决问题。

你可以使用以下工具:
{self._get_tools_description()}

请按照以下格式回复:
Thought: [你对当前情况的思考，规划下一步]
Action: [你要使用的工具名称]
Action Input: [工具的输入参数]

当你获得足够信息时，使用 answer 工具给出最终答案。
"""

    def run(self, query: str) -> str:
        """
        运行 Agent 处理用户查询

        Args:
            query: 用户输入的问题

        Returns:
            最终答案
        """
        print(f"\n{'='*60}")
        print(f"用户查询: {query}")
        print(f"{'='*60}\n")

        # 初始化对话历史
        self.messages = [
            Message(role="system", content=self._build_system_prompt()),
            Message(role="user", content=query)
        ]

        self.history = []
        step = 0

        # ReAct 循环
        while step < self.max_steps:
            step += 1
            print(f"\n--- 步骤 {step} ---")

            # 1. 调用大模型获取 Thought 和 Action
            llm_response = self.llm.chat(self.messages, self._get_tools_description())
            print(f"LLM 响应:\n{llm_response}\n")

            # 2. 解析响应
            thought, action, action_input = self._parse_llm_response(llm_response)

            if not action:
                print("错误: 无法解析 Action")
                break

            print(f"解析结果:")
            print(f"  Thought: {thought}")
            print(f"  Action: {action}")
            print(f"  Action Input: {action_input}")

            # 3. 执行 Action
            if action == "answer":
                # 最终答案
                observation = f"任务完成，最终答案: {action_input}"
                self._record_step(step, thought, action, action_input, observation)
                print(f"\n观察结果: {observation}")
                print(f"\n{'='*60}")
                print(f"最终答案: {action_input}")
                print(f"{'='*60}")
                return action_input

            # 执行工具
            if action in self.tools:
                tool = self.tools[action]
                observation = tool.execute(action_input)
            else:
                observation = f"错误: 未知工具 '{action}'"

            print(f"\n观察结果: {observation}")

            # 4. 记录步骤
            self._record_step(step, thought, action, action_input, observation)

            # 5. 更新对话历史
            assistant_msg = f"Thought: {thought}\nAction: {action}\nAction Input: {action_input}"
            self.messages.append(Message(role="assistant", content=assistant_msg))
            self.messages.append(Message(role="user", content=f"Observation: {observation}"))

        # 达到最大步数限制
        return "达到最大执行步数限制，未能完成任务"

    def _record_step(self, step_num: int, thought: str, action: str,
                     action_input: str, observation: str):
        """记录执行步骤"""
        step = AgentStep(
            step_number=step_num,
            thought=thought,
            action=action,
            action_input=action_input,
            observation=observation
        )
        self.history.append(step)

    def get_history(self) -> List[AgentStep]:
        """获取执行历史"""
        return self.history

    def print_history(self):
        """打印执行历史"""
        print(f"\n{'='*60}")
        print("执行历史:")
        print(f"{'='*60}")
        for step in self.history:
            print(f"\n步骤 {step.step_number}:")
            print(f"  Thought: {step.thought}")
            print(f"  Action: {step.action}({step.action_input})")
            print(f"  Observation: {step.observation}")


def demo():
    """
    演示 ReAct Agent 的使用
    """
    # 创建模拟的大模型
    llm = MockLLM()

    # 创建 Agent
    agent = ReActAgent(llm=llm, max_steps=5)

    # 示例 1: 搜索类问题
    print("\n" + "="*60)
    print("示例 1: 搜索类问题")
    print("="*60)
    result1 = agent.run("搜索一下 ReAct 是什么")
    agent.print_history()

    # 示例 2: 计算类问题
    print("\n" + "="*60)
    print("示例 2: 计算类问题")
    print("="*60)
    result2 = agent.run("计算 123 * 456 等于多少")
    agent.print_history()

    # 示例 3: 一般问题
    print("\n" + "="*60)
    print("示例 3: 一般问题")
    print("="*60)
    result3 = agent.run("介绍一下你自己")
    agent.print_history()

    print(f"\n\n大模型总共被调用了 {llm.call_count} 次")


if __name__ == "__main__":
    demo()
