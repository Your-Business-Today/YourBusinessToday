<script lang="ts">
	import PageTitle from '$lib/components/site/PageTitle.svelte';
	import TodoAddForm from '$lib/components/todos/TodoAddForm.svelte';
	import TodoList from '$lib/components/todos/TodoList.svelte';
	import MyTaskList from '$lib/components/todos/MyTaskList.svelte';
	import { panelClasses } from '$lib/components/site/formStyles';

	let { data } = $props();
</script>

<svelte:head>
	<title>My work — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
	<PageTitle>My work</PageTitle>
	<section class={panelClasses} aria-labelledby="my-tasks">
		<h2 id="my-tasks" class="font-display text-sm tracking-widest text-chalk/60 uppercase">My project tasks</h2>
		<MyTaskList tasks={data.myTasks} />
	</section>
	<section class={panelClasses} aria-labelledby="my-todos">
		<h2 id="my-todos" class="font-display text-sm tracking-widest text-chalk/60 uppercase">Personal to-dos</h2>
		<TodoAddForm />
		<TodoList todos={data.todos} emptyNote="Nothing on your list." />
	</section>
	<section class={panelClasses} aria-labelledby="untaken-todos">
		<h2 id="untaken-todos" class="font-display text-sm tracking-widest text-chalk/60 uppercase">
			On your projects, for anyone to take
		</h2>
		<TodoList todos={data.untakenTodos} emptyNote="Nothing waiting to be taken." canTake />
	</section>
</div>
