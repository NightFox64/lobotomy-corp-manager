export namespace backend {
	
	export class Config {
	    id: number;
	    is_tutorial_finished: boolean;
	    reminder1_min: number;
	    reminder2_min: number;
	    reminder3_min: number;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.is_tutorial_finished = source["is_tutorial_finished"];
	        this.reminder1_min = source["reminder1_min"];
	        this.reminder2_min = source["reminder2_min"];
	        this.reminder3_min = source["reminder3_min"];
	    }
	}
	export class Task {
	    id: number;
	    title: string;
	    description: string;
	    deadline: string;
	    time: string;
	    is_done: boolean;
	    repeat: string;
	
	    static createFrom(source: any = {}) {
	        return new Task(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.description = source["description"];
	        this.deadline = source["deadline"];
	        this.time = source["time"];
	        this.is_done = source["is_done"];
	        this.repeat = source["repeat"];
	    }
	}

}

